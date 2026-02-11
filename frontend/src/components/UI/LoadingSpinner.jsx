export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-500" />
      <span className="ml-3 text-sm text-gray-500">データ取得中…</span>
    </div>
  );
}
