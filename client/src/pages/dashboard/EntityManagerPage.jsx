import { ChevronLeft, ChevronRight, Filter, Lock, Plus, RefreshCcw, Search, ShieldCheck, Sparkles } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import api from "../../api/client";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/ui/DataTable";
import FormField from "../../components/ui/FormField";
import LoadingScreen from "../../components/ui/LoadingScreen";
import Modal from "../../components/ui/Modal";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { useQueryClient } from "../../context/QueryClientContext";
import { getAccessSummary, getModulePermissions } from "../../data/accessControl";
import { useToast } from "../../context/ToastContext";

const buildEmptyForm = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.type === "checkbox" ? false : field.defaultValue || "";
    return accumulator;
  }, {});

const buildFilterState = (filters = []) =>
  filters.reduce((accumulator, filter) => {
    accumulator[filter.name] = filter.defaultValue || "all";
    return accumulator;
  }, {});

const parseCollectionResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: null,
    };
  }

  return {
    items: payload?.items || [],
    pagination: payload?.pagination || null,
  };
};

const EntityManagerPage = ({ config, moduleKey }) => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState([]);
  const [dependencies, setDependencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(buildFilterState(config.filters));
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formValues, setFormValues] = useState(buildEmptyForm(config.fields));
  const deferredSearch = useDeferredValue(search);
  const permissions = useMemo(() => getModulePermissions(moduleKey, user?.role), [moduleKey, user?.role]);
  const accessSummary = useMemo(() => getAccessSummary(permissions), [permissions]);

  useEffect(() => {
    setFilters(buildFilterState(config.filters));
    setPage(1);
  }, [config.filters]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        ...(deferredSearch ? { q: deferredSearch } : {}),
        ...(config.enablePagination ? { paged: true, page, limit: config.pageSize || 8 } : {}),
        ...(config.defaultSort ? { sort: config.defaultSort } : {}),
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "all" && value !== "")),
      };

      const requests = [api.get(config.endpoint, { params }), ...(config.dependencies || []).map((dependency) => api.get(dependency.endpoint))];
      const responses = await Promise.all(requests);
      const [primaryResponse, ...dependencyResponses] = responses;
      const parsedCollection = parseCollectionResponse(primaryResponse.data);

      setItems(parsedCollection.items);
      setPagination(parsedCollection.pagination);
      setDependencies(
        (config.dependencies || []).reduce((accumulator, dependency, index) => {
          accumulator[dependency.key] = dependencyResponses[index].data;
          return accumulator;
        }, {})
      );
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load data for this module.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [config, deferredSearch, filters, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const highlights = useMemo(() => config.getHighlights?.(items, dependencies) || [], [config, dependencies, items]);

  const openCreateModal = () => {
    if (!permissions.create) {
      return;
    }

    setSelectedItem(null);
    setFormValues(buildEmptyForm(config.fields));
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    if (!permissions.edit) {
      return;
    }

    setSelectedItem(item);
    setFormValues(config.toFormValues ? config.toFormValues(item, dependencies) : item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setFormValues(buildEmptyForm(config.fields));
  };

  const handleFieldChange = (name, value) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const invalidateRelatedData = () => {
    queryClient.invalidateQueries(config.endpoint);
    queryClient.invalidateQueries("dashboard-summary");
    queryClient.invalidateQueries("reports-overview");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = config.fromFormValues ? config.fromFormValues(formValues, dependencies, selectedItem, user) : formValues;

      if (selectedItem) {
        await api.put(`${config.endpoint}/${selectedItem._id}`, payload);
        pushToast({
          tone: "success",
          title: "Record updated",
          message: `${config.title} was updated successfully.`,
        });
      } else {
        await api.post(config.endpoint, payload);
        pushToast({
          tone: "success",
          title: "Record created",
          message: `${config.title} entry created successfully.`,
        });
      }

      closeModal();
      invalidateRelatedData();
      await loadData();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to save changes.";
      setError(message);
      pushToast({
        tone: "error",
        title: "Save failed",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!permissions.delete) {
      return;
    }

    const itemLabel = item.name || item.orderNumber || item.guestName || "this entry";
    const confirmed = await confirm({
      title: `Delete ${itemLabel}?`,
      description: "This action will remove the record permanently from the operations database.",
      confirmLabel: "Delete Record",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      invalidateRelatedData();
      await loadData();
      pushToast({
        tone: "success",
        title: "Record deleted",
        message: `${config.title} was updated after removing the selected record.`,
      });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to delete the record.";
      setError(message);
      pushToast({
        tone: "error",
        title: "Delete failed",
        message,
      });
    }
  };

  if (loading) {
    return <LoadingScreen label={`Loading ${config.title.toLowerCase()}...`} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operations Management"
        title={config.title}
        description={config.subtitle}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              className="btn-secondary py-2.5 text-xs font-bold"
            >
              <RefreshCcw className="mr-1.5 h-3.5 w-3.5 text-stone-500" />
              <span>Refresh</span>
            </button>
            {permissions.create ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="btn-primary py-2.5 text-xs font-bold shadow-md shadow-brand-500/25"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                <span>{config.buttonLabel}</span>
              </button>
            ) : null}
          </div>
        }
      />

      {error ? (
        <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800 text-xs font-bold">!</span>
          <span>{error}</span>
        </div>
      ) : null}

      {highlights.length ? (
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} subtitle={item.subtitle} />
          ))}
        </div>
      ) : null}

      {/* Role access reassurance bar */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-brand-200/80 bg-brand-50/70 px-5 py-3 text-xs font-semibold text-brand-900 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <span>{accessSummary}</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600">Active Module</span>
      </div>

      <SectionCard
        title="Operating Database Records"
        subtitle="Search, filter, update, and manage entries with automatic relation syncing."
        action={
          <div className="flex flex-col gap-3 md:items-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={config.searchPlaceholder}
                className="input-shell pl-10 md:w-80"
              />
            </div>
            {config.filters?.length ? (
              <div className="flex flex-wrap gap-2.5 md:justify-end">
                {config.filters.map((filter) => (
                  <select
                    key={filter.name}
                    value={filters[filter.name] ?? "all"}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.name]: event.target.value }))}
                    className="input-shell font-semibold text-xs min-w-[140px]"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {filter.label}: {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            ) : null}
          </div>
        }
      >
        <DataTable
          columns={config.columns}
          rows={items}
          onEdit={permissions.edit ? openEditModal : undefined}
          onDelete={permissions.delete ? handleDelete : undefined}
          emptyTitle={config.emptyTitle}
          emptyDescription={config.emptyDescription}
        />

        {pagination ? (
          <div className="mt-6 flex flex-col gap-3 border-t border-brand-100/60 pt-5 md:flex-row md:items-center md:justify-between text-xs">
            <p className="font-semibold text-stone-500">
              Showing page <span className="font-bold text-stone-800">{pagination.page}</span> of {pagination.totalPages} ({pagination.total} total records)
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={pagination.page <= 1}
                className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {/* Create / Edit Modal */}
      {permissions.create || permissions.edit ? (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={selectedItem ? `Edit ${config.buttonLabel.replace("Add ", "")}` : config.buttonLabel}
          subtitle="Complete the form fields below and save to apply changes immediately."
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {config.fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" || field.type === "file" ? "md:col-span-2" : ""}>
                  <FormField
                    field={field}
                    value={formValues[field.name]}
                    onChange={handleFieldChange}
                    dependencies={dependencies}
                    formValues={formValues}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-brand-100/60 pt-5">
              <button type="button" onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary font-bold">
                {submitting ? "Processing..." : selectedItem ? "Update Record" : "Create Record"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default EntityManagerPage;
