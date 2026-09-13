import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "react-select";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function formatDateForInput(dateValue) {
  const date = new Date(dateValue);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDateForInput(new Date());
}

function formatTimeForInput(dateValue) {
  const date = new Date(dateValue);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function changeDate(dateString, numberOfDays) {
  const date = new Date(`${dateString}T12:00:00`);

  date.setDate(date.getDate() + numberOfDays);

  return formatDateForInput(date);
}

function formatDateHeading(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAppointmentTime(dateValue) {
  const date = new Date(dateValue);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getSelectControlStyles(baseStyles, state) {
  const styles = {
    ...baseStyles,
    minHeight: "38px",
    borderRadius: "0",
    borderColor: "#cbd5e1",
    boxShadow: "none",
  };

  if (state.isFocused) {
    styles.borderColor = "#6558B1";
    styles.boxShadow = "0 0 0 1px #6558B1";
  }

  styles["&:hover"] = {
    borderColor: "#6558B1",
  };

  return styles;
}

function getSelectOptionStyles(baseStyles, state) {
  const styles = {
    ...baseStyles,
    backgroundColor: "white",
    color: "#334155",
    cursor: "pointer",
  };

  if (state.isFocused) {
    styles.backgroundColor = "#f1eff8";
  }

  if (state.isSelected) {
    styles.backgroundColor = "#6558B1";
    styles.color = "white";
  }

  return styles;
}

function getSelectMenuStyles(baseStyles) {
  return {
    ...baseStyles,
    borderRadius: "0",
    zIndex: 20,
  };
}

const selectStyles = {
  control: getSelectControlStyles,
  option: getSelectOptionStyles,
  menu: getSelectMenuStyles,
};

function SchedulePage() {
  const [searchParams] = useSearchParams();

  let selectedClientId = searchParams.get("clientId");

  if (selectedClientId === null) {
    selectedClientId = "";
  }

  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getToday());

  const [form, setForm] = useState({
    clientId: selectedClientId,
    date: getToday(),
    startTime: "09:00",
    endTime: "10:00",
  });

  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);

  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentRefresh, setAppointmentRefresh] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(function () {
    async function loadClients() {
      try {
        const response = await fetch(`${API_URL}/clients`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setClients(data.clients);
      } catch (error) {
        setError(error.message || "Unable to load clients.");
      } finally {
        setIsLoadingClients(false);
      }
    }

    loadClients();
  }, []);

  useEffect(
    function () {
      async function loadAppointments() {
        setIsLoadingAppointments(true);

        try {
          const startOfDay = new Date(`${selectedDate}T00:00:00`);

          const startOfNextDay = new Date(`${selectedDate}T00:00:00`);

          startOfNextDay.setDate(startOfNextDay.getDate() + 1);

          const parameters = new URLSearchParams({
            from: startOfDay.toISOString(),
            to: startOfNextDay.toISOString(),
          });

          const response = await fetch(
            `${API_URL}/appointments?${parameters}`,
            {
              credentials: "include",
            },
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message);
          }

          setAppointments(data.appointments);
        } catch (error) {
          setError(error.message || "Unable to load appointments.");
        } finally {
          setIsLoadingAppointments(false);
        }
      }

      loadAppointments();
    },
    [selectedDate, appointmentRefresh],
  );

  function handleFormChange(event) {
    const inputName = event.target.name;
    const inputValue = event.target.value;

    setForm(function (currentForm) {
      return {
        ...currentForm,
        [inputName]: inputValue,
      };
    });
  }

  function handleClientChange(selectedOption) {
    let clientId = "";

    if (selectedOption !== null) {
      clientId = selectedOption.value;
    }

    setForm(function (currentForm) {
      return {
        ...currentForm,
        clientId: clientId,
      };
    });
  }

  function handleScheduleDateChange(event) {
    setSelectedDate(event.target.value);
  }

  function showToday() {
    setSelectedDate(getToday());
  }

  function showPreviousDay() {
    setSelectedDate(function (currentDate) {
      return changeDate(currentDate, -1);
    });
  }

  function showNextDay() {
    setSelectedDate(function (currentDate) {
      return changeDate(currentDate, 1);
    });
  }

  function reloadAppointments() {
    setAppointmentRefresh(function (currentValue) {
      return currentValue + 1;
    });
  }

  function resetForm() {
    setForm({
      clientId: selectedClientId,
      date: getToday(),
      startTime: "09:00",
      endTime: "10:00",
    });

    setEditingAppointmentId(null);
  }

  function handleEdit(appointment) {
    setEditingAppointmentId(appointment.id);

    setForm({
      clientId: String(appointment.client_id),
      date: formatDateForInput(appointment.start_time),
      startTime: formatTimeForInput(appointment.start_time),
      endTime: formatTimeForInput(appointment.end_time),
    });

    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    resetForm();
    setError("");
    setSuccess("");
  }

  async function handleDelete(appointment) {
    const confirmed = window.confirm(
      `Delete the appointment for ${appointment.client_name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingAppointmentId(appointment.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointment.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (editingAppointmentId === appointment.id) {
        resetForm();
      }

      setSuccess("Appointment deleted successfully.");
      reloadAppointments();
    } catch (error) {
      setError(error.message || "Unable to delete appointment.");
    } finally {
      setDeletingAppointmentId(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const start = new Date(`${form.date}T${form.startTime}:00`);

    const end = new Date(`${form.date}T${form.endTime}:00`);

    if (end <= start) {
      setError("The end time must be later than the start time.");

      setIsSubmitting(false);
      return;
    }

    let requestUrl = `${API_URL}/appointments`;
    let requestMethod = "POST";
    let successMessage = "Appointment scheduled successfully.";

    if (editingAppointmentId !== null) {
      requestUrl = `${API_URL}/appointments/${editingAppointmentId}`;

      requestMethod = "PATCH";
      successMessage = "Appointment updated successfully.";
    }

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          clientId: Number(form.clientId),
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      const savedDate = form.date;

      setSuccess(successMessage);
      resetForm();

      if (selectedDate === savedDate) {
        reloadAppointments();
      } else {
        setSelectedDate(savedDate);
      }
    } catch (error) {
      setError(error.message || "Unable to save appointment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const clientOptions = clients.map(function (client) {
    return {
      value: String(client.id),
      label: client.name,
    };
  });

  let selectedClientOption = null;

  const matchingOption = clientOptions.find(function (option) {
    return option.value === String(form.clientId);
  });

  if (matchingOption !== undefined) {
    selectedClientOption = matchingOption;
  }

  let formTitle = "New Appointment";
  let submitButtonText = "Schedule Appointment";
  let minimumDate = getToday();
  let clientPlaceholder = "Type to search for a client...";

  if (editingAppointmentId !== null) {
    formTitle = "Edit Appointment";
    submitButtonText = "Update Appointment";
    minimumDate = "";
  }

  if (isSubmitting) {
    submitButtonText = "Saving...";
  }

  if (isLoadingClients) {
    clientPlaceholder = "Loading clients...";
  }

  let appointmentList;

  if (isLoadingAppointments) {
    appointmentList = (
      <p className="mt-6 text-slate-500">Loading scheduled clients...</p>
    );
  } else if (appointments.length === 0) {
    appointmentList = (
      <div className="mt-6 border border-dashed border-slate-300 p-8 text-center">
        <p className="text-slate-500">
          No clients are scheduled for this date.
        </p>
      </div>
    );
  } else {
    appointmentList = (
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#f1eff8] text-[#494263]">
            <tr>
              <th className="border border-slate-300 px-4 py-2">Name</th>

              <th className="border border-slate-300 px-4 py-2">Address</th>

              <th className="border border-slate-300 px-4 py-2">Phone</th>

              <th className="border border-slate-300 px-4 py-2">Time</th>

              <th className="border border-slate-300 px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map(function (appointment) {
              let deleteButtonText = "Delete";

              if (deletingAppointmentId === appointment.id) {
                deleteButtonText = "Deleting...";
              }

              return (
                <tr key={appointment.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2 font-medium text-[#494263]">
                    {appointment.client_name}
                  </td>

                  <td className="border border-slate-300 px-4 py-2 text-slate-600">
                    {appointment.address}
                  </td>

                  <td className="border border-slate-300 px-4 py-2 text-slate-600">
                    {appointment.phone_number}
                  </td>

                  <td className="whitespace-nowrap border border-slate-300 px-4 py-2 text-slate-600">
                    {formatAppointmentTime(appointment.start_time)}

                    {" – "}

                    {formatAppointmentTime(appointment.end_time)}
                  </td>

                  <td className="whitespace-nowrap border border-slate-300 px-4 py-2">
                    <button
                      type="button"
                      onClick={function () {
                        handleEdit(appointment);
                      }}
                      className="mr-3 cursor-pointer text-[#6558B1] underline underline-offset-2"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={function () {
                        handleDelete(appointment);
                      }}
                      disabled={deletingAppointmentId === appointment.id}
                      className="cursor-pointer text-red-600 underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleteButtonText}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <main className="px-12 py-8 max-sm:px-5">
      <h1 className="text-2xl font-bold uppercase text-[#494263]">Schedule</h1>

      <p className="mt-4 text-slate-600">
        Schedule clients and view bookings by date.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(300px,380px)_1fr]">
        <form onSubmit={handleSubmit}>
          <fieldset className="border border-slate-300 px-7 pb-7 pt-4">
            <legend className="px-2 text-lg font-semibold text-[#494263]">
              {formTitle}
            </legend>

            <div className="mt-4">
              <label htmlFor="clientId" className="mb-2 block text-slate-700">
                Client:
              </label>

              <Select
                inputId="clientId"
                options={clientOptions}
                value={selectedClientOption}
                onChange={handleClientChange}
                placeholder={clientPlaceholder}
                noOptionsMessage={function () {
                  return "No clients found";
                }}
                isSearchable={true}
                isClearable={true}
                isDisabled={isLoadingClients}
                styles={selectStyles}
              />
            </div>

            <div className="mt-5">
              <label htmlFor="date" className="mb-2 block text-slate-700">
                Date:
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                min={minimumDate}
                onChange={handleFormChange}
                className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
                required
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="mb-2 block text-slate-700"
                >
                  Start Time:
                </label>

                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="mb-2 block text-slate-700">
                  End Time:
                </label>

                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                className="mt-5 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="mt-5 bg-green-50 px-3 py-2 text-sm text-green-700"
                role="status"
              >
                {success}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !form.clientId}
                className="cursor-pointer bg-[#6558B1] px-5 py-1.5 text-white transition hover:bg-[#554C7A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitButtonText}
              </button>

              {editingAppointmentId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                  className="cursor-pointer border border-slate-400 px-5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              )}
            </div>
          </fieldset>
        </form>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#494263]">
                Scheduled Clients
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {formatDateHeading(selectedDate)}
              </p>
            </div>

            <button
              type="button"
              onClick={showToday}
              className="cursor-pointer border border-[#6558B1] px-3 py-1.5 text-sm text-[#6558B1] hover:bg-[#f1eff8]"
            >
              Today
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={showPreviousDay}
              className="cursor-pointer border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Previous
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={handleScheduleDateChange}
              className="min-w-0 flex-1 border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
              aria-label="Select schedule date"
            />

            <button
              type="button"
              onClick={showNextDay}
              className="cursor-pointer border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Next
            </button>
          </div>

          {appointmentList}
        </section>
      </div>
    </main>
  );
}

export default SchedulePage;
