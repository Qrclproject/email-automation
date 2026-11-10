export default function BlockedImagesView({ recipientName }: { recipientName: string }) {
  return (
    <div className="w-full max-w-[600px] bg-white p-8 shadow-sm rounded-lg mx-auto flex justify-center">
      <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 w-full max-w-sm">
        <span className="text-3xl block mb-3">🖼️</span>
        <p className="text-gray-900 font-medium mb-1">Images are blocked.</p>
        <p className="text-sm text-gray-500">Invitation for {recipientName}</p>
        <button className="text-blue-600 text-sm underline mt-3 hover:text-blue-800">
          Display images below
        </button>
      </div>
    </div>
  );
}