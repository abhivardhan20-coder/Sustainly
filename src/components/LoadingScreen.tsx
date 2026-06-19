export function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-surface dark:bg-gray-900">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4 text-secondary dark:text-gray-300">Loading your sustainability journey...</p>
      </div>
    </div>
  );
}
