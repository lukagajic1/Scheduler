import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  name: "",
  address: "",
  phoneNumber: "",
};

function ClientsPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingClientId, setEditingClientId] = useState(null);
  const [deletingClientId, setDeletingClientId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        const response = await fetch("http://localhost:5000/api/clients", {
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
        setIsLoading(false);
      }
    }

    loadClients();
  }, []);

  function handleChange(event) {
    const inputName = event.target.name;
    const inputValue = event.target.value;

    setForm(function (currentForm) {
      return {
        ...currentForm,
        [inputName]: inputValue,
      };
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingClientId(null);
  }

  function handleEdit(client) {
    setEditingClientId(client.id);

    setForm({
      name: client.name,
      address: client.address,
      phoneNumber: client.phone_number,
    });

    setError("");
    setSuccess("");
  }

  function handleCancelEdit() {
    resetForm();
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let action = "save";

    if (event.nativeEvent.submitter) {
      action = event.nativeEvent.submitter.value;
    }

    let url = "http://localhost:5000/api/clients";
    let method = "POST";

    if (editingClientId !== null) {
      url = `http://localhost:5000/api/clients/${editingClientId}`;
      method = "PATCH";
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (editingClientId !== null) {
        setClients(function (currentClients) {
          const updatedClients = currentClients.map(function (client) {
            if (client.id === editingClientId) {
              return data.client;
            }

            return client;
          });

          updatedClients.sort(function (firstClient, secondClient) {
            return firstClient.name.localeCompare(secondClient.name);
          });

          return updatedClients;
        });

        setSuccess("Client updated successfully.");
        resetForm();
        return;
      }

      if (action === "schedule") {
        navigate(`/schedule?clientId=${data.client.id}`);
        return;
      }

      setClients(function (currentClients) {
        const updatedClients = [...currentClients, data.client];

        updatedClients.sort(function (firstClient, secondClient) {
          return firstClient.name.localeCompare(secondClient.name);
        });

        return updatedClients;
      });

      setSuccess("Client saved successfully.");
      resetForm();
    } catch (error) {
      setError(error.message || "Unable to save client.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(client) {
    const confirmed = window.confirm(
      `Delete ${client.name}? Their appointments will also be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingClientId(client.id);

    try {
      const response = await fetch(
        `http://localhost:5000/api/clients/${client.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setClients(function (currentClients) {
        return currentClients.filter(function (currentClient) {
          return currentClient.id !== client.id;
        });
      });

      if (editingClientId === client.id) {
        resetForm();
      }

      setSuccess("Client deleted successfully.");
    } catch (error) {
      setError(error.message || "Unable to delete client.");
    } finally {
      setDeletingClientId(null);
    }
  }

  let formTitle = "New Client";

  if (editingClientId !== null) {
    formTitle = "Edit Client";
  }

  let submitButtonText = "Save Client";

  if (editingClientId !== null) {
    submitButtonText = "Update Client";
  }

  if (isSubmitting) {
    submitButtonText = "Saving...";
  }

  let secondaryButton;

  if (editingClientId !== null) {
    secondaryButton = (
      <button
        type="button"
        onClick={handleCancelEdit}
        disabled={isSubmitting}
        className="cursor-pointer border border-slate-400 px-5 py-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>
    );
  } else {
    let scheduleButtonText = "Save & Schedule";

    if (isSubmitting) {
      scheduleButtonText = "Saving...";
    }

    secondaryButton = (
      <button
        type="submit"
        value="schedule"
        disabled={isSubmitting}
        className="cursor-pointer bg-[#6558B1] px-5 py-1.5 text-white transition hover:bg-[#554C7A] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {scheduleButtonText}
      </button>
    );
  }

  let clientList;

  if (isLoading) {
    clientList = <p className="mt-4 text-slate-500">Loading clients...</p>;
  } else if (clients.length === 0) {
    clientList = (
      <p className="mt-4 text-slate-500">No clients have been added.</p>
    );
  } else {
    clientList = (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#f1eff8] text-[#494263]">
            <tr>
              <th className="border border-slate-300 px-4 py-2">Name</th>

              <th className="border border-slate-300 px-4 py-2">Address</th>

              <th className="border border-slate-300 px-4 py-2">Phone</th>

              <th className="border border-slate-300 px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {clients.map(function (client) {
              let deleteButtonText = "Delete";

              if (deletingClientId === client.id) {
                deleteButtonText = "Deleting...";
              }

              return (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 px-4 py-2">
                    {client.name}
                  </td>

                  <td className="border border-slate-300 px-4 py-2">
                    {client.address}
                  </td>

                  <td className="border border-slate-300 px-4 py-2">
                    {client.phone_number}
                  </td>

                  <td className="whitespace-nowrap border border-slate-300 px-4 py-2">
                    <button
                      type="button"
                      onClick={function () {
                        handleEdit(client);
                      }}
                      className="mr-3 cursor-pointer text-[#6558B1] underline underline-offset-2"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={function () {
                        handleDelete(client);
                      }}
                      disabled={deletingClientId === client.id}
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
      <h1 className="text-2xl font-bold uppercase text-[#494263]">Clients</h1>

      <p className="mt-4 text-slate-600">
        Add clients and view their saved contact information.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(300px,420px)_1fr]">
        <form onSubmit={handleSubmit}>
          <fieldset className="border border-slate-300 px-7 pb-7 pt-4">
            <legend className="px-2 text-lg font-semibold text-[#494263]">
              {formTitle}
            </legend>

            <div className="mt-4">
              <label htmlFor="name" className="mb-2 block text-slate-700">
                Name:
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
                required
              />
            </div>

            <div className="mt-5">
              <label htmlFor="address" className="mb-2 block text-slate-700">
                Address:
              </label>

              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
                required
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-slate-700"
              >
                Phone Number:
              </label>

              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
                required
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                value="save"
                disabled={isSubmitting}
                className="cursor-pointer border border-[#6558B1] px-5 py-1.5 text-[#6558B1] transition hover:bg-[#f1eff8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitButtonText}
              </button>

              {secondaryButton}
            </div>
          </fieldset>
        </form>

        <section>
          <h2 className="text-lg font-semibold text-[#494263]">
            Saved Clients
          </h2>

          {error && (
            <p
              className="mt-4 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              className="mt-4 bg-green-50 px-3 py-2 text-sm text-green-700"
              role="status"
            >
              {success}
            </p>
          )}

          {clientList}
        </section>
      </div>
    </main>
  );
}

export default ClientsPage;
