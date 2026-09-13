function HomePage() {
  return (
    <main className="px-8 py-9 max-sm:px-5 max-sm:py-7">
      <h1 className="mb-6 text-3xl font-bold text-slate-700">Welcome!</h1>

      <div className="space-y-2 text-lg leading-7 text-slate-600">
        <p>Scheduler is a client appointment-management system.</p>
        <p>
          Access to the scheduling dashboard is limited to authorized users.
        </p>
        <p>Please log in to manage clients and appointments.</p>
      </div>
    </main>
  );
}

export default HomePage;
