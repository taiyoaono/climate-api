export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
      <span className="font-medium">エラー:</span> {message}
    </div>
  );
}
