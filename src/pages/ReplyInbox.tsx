import { Inbox } from 'lucide-react';

export default function ReplyInbox() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reply Inbox</h1>
        <p className="text-gray-500 text-sm">Overview of replies to your campaigns</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your inbox is empty</h3>
        <p className="text-gray-500">Replies to your campaign emails will appear here.</p>
      </div>
    </div>
  );
}