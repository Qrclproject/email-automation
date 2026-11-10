import { Button } from '../components/common/Button';

export default function Settings() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 text-sm">Global configuration for your workspace</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-2xl">
        <h2 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
            <input type="text" defaultValue="QRCODE Enterprise" className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select className="w-full border border-gray-300 rounded-lg p-2 text-sm">
              <option>Africa/Lagos (WAT)</option>
              <option>UTC</option>
            </select>
          </div>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}