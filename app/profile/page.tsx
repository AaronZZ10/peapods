import { getProfile, updateProfile } from "@/lib/actions/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Mail, GraduationCap, FileText, CheckCircle, Image as ImageIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = authUser;
  if (!user && process.env.NODE_ENV === "development") {
    user = {
      id: "mock-student-id-1234",
      email: "mock-student@drexel.edu",
    } as any;
  }

  if (!user) {
    redirect("/");
  }

  const profile = await getProfile();

  if (!profile) {
    redirect("/");
  }

  const isEduEmail = user.email?.endsWith(".edu");

  async function handleUpdateProfile(formData: FormData) {
    "use server";
    const full_name = formData.get("fullName") as string;
    const university = formData.get("university") as string;
    const bio = formData.get("bio") as string;
    const avatar_url = formData.get("avatarUrl") as string;

    await updateProfile({
      full_name,
      university,
      bio,
      avatar_url: avatar_url || undefined,
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 px-2 py-4">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Your PeaPods Profile</h1>
            <p className="text-emerald-100/90 text-sm max-w-md font-medium">
              Manage your personal student details and verify your status to find the perfect sublease.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold self-start sm:self-center">
            {isEduEmail ? (
              <>
                <CheckCircle className="h-4.5 w-4.5 text-emerald-300 fill-emerald-500/20" />
                <span>Verified Student Status</span>
              </>
            ) : (
              <>
                <User className="h-4.5 w-4.5 text-emerald-200" />
                <span>Standard User Account</span>
              </>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Preview */}
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-3xl border-slate-200/60 bg-white shadow-sm overflow-hidden text-center p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative h-24 w-24 rounded-full bg-slate-100 border-2 border-slate-200/60 flex items-center justify-center overflow-hidden shadow-inner">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{profile.full_name}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{profile.university || "University Student"}</p>
              </div>
              <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2 items-start text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" /> {profile.email}
                </span>
                {isEduEmail && (
                  <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg font-bold">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified Student
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Card: Edit Form */}
        <div className="md:col-span-2">
          <Card className="rounded-3xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
              <CardTitle className="text-slate-900 font-bold">Account Settings</CardTitle>
              <CardDescription>Update your public details visible to hosts and applicants.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form action={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                    </label>
                    <Input
                      type="text"
                      id="fullName"
                      name="fullName"
                      defaultValue={profile.full_name || ""}
                      required
                      placeholder="Jane Doe"
                      className="h-10 border-slate-200 rounded-xl focus:ring-emerald-50 focus:border-emerald-500"
                    />
                  </div>

                  {/* University */}
                  <div className="space-y-1.5">
                    <label htmlFor="university" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> University / Company
                    </label>
                    <Input
                      type="text"
                      id="university"
                      name="university"
                      defaultValue={profile.university || ""}
                      required
                      placeholder="Drexel University"
                      className="h-10 border-slate-200 rounded-xl focus:ring-emerald-50 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="space-y-1.5">
                  <label htmlFor="avatarUrl" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" /> Avatar Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    id="avatarUrl"
                    name="avatarUrl"
                    defaultValue={profile.avatar_url || ""}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-10 border-slate-200 rounded-xl focus:ring-emerald-50 focus:border-emerald-500"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label htmlFor="bio" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> Bio / About You
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile.bio || ""}
                    rows={4}
                    placeholder="Tell hosts about yourself (e.g. major, internship company, cleanliness preferences)..."
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                  />
                </div>

                {/* Submit button */}
                <div className="border-t border-slate-100 pt-6 flex justify-end">
                  <Button
                    type="submit"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
