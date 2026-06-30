'use client'

import { createListing } from '@/lib/actions/listings'

export function CreateListingForm() {
  return (
    <div className="border rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Create New Listing</h2>
      <form action={createListing} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Room for rent near campus"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            className="w-full border rounded px-3 py-2"
            placeholder="Tell others about your place..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price ($/month)</label>
            <input
              type="number"
              name="price"
              required
              min="0"
              className="w-full border rounded px-3 py-2"
              placeholder="800"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            name="address"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="123 College Ave, University City"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              name="latitude"
              step="0.0001"
              required
              className="w-full border rounded px-3 py-2"
              placeholder="39.9526"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              name="longitude"
              step="0.0001"
              required
              className="w-full border rounded px-3 py-2"
              placeholder="-75.1652"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Create Listing
        </button>
      </form>
    </div>
  )
}
