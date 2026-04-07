export function SavingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">保存中...</p>
      </div>
    </div>
  );
}
