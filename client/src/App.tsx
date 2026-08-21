function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-brand-600 mb-4">
          SyncBoard
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Real-time collaborative project board for teams that move fast.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-500">Client running</span>
        </div>
      </div>
    </div>
  );
}

export default App;
