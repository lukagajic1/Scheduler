function AboutPage() {
  return (
    <main className="px-12 py-8 max-sm:px-5">
      <h1 className="text-2xl font-bold uppercase text-[#494263]">
        About Scheduler
      </h1>

      <div className="mt-6 max-w-3xl space-y-4 text-slate-600">
        <p>
          Scheduler is a full-stack appointment-management application built for
          small service businesses. Users can manage client information,
          schedule appointments, and view bookings by date.
        </p>

        <p>Built with React, Tailwind CSS, Node.js, Express, and PostgreSQL.</p>
      </div>
    </main>
  );
}

export default AboutPage;
