"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RatioSettings = {
  cement: number;
  sand: number;
  aggregate?: number;
};

type Settings = {
  concrete: {
    pcc: RatioSettings;
    rcc: RatioSettings;
    dryVolumeFactor: number;
    cementBagVolume: number;
  };
  masonry: {
    bricksPerM3: number;
    mortarWetVolumePerM3: number;
    mortarDryVolumeFactor: number;
    mortarRatio: { cement: number; sand: number };
  };
  plaster: {
    internal: {
      thicknessMm: number;
      dryVolumeFactor: number;
      ratio: { cement: number; sand: number };
    };
    external: {
      thicknessMm: number;
      dryVolumeFactor: number;
      ratio: { cement: number; sand: number };
    };
  };
  painting: {
    internalCoverageM2PerLitre: number;
    externalCoverageM2PerLitre: number;
    coats: number;
  };
  labour: Array<{ key: string; label: string; unit: string; rate: number }>;
};

const blank: Settings = {
  concrete: {
    pcc: { cement: 0, sand: 0, aggregate: 0 },
    rcc: { cement: 0, sand: 0, aggregate: 0 },
    dryVolumeFactor: 0,
    cementBagVolume: 0.0347,
  },
  masonry: {
    bricksPerM3: 0,
    mortarWetVolumePerM3: 0,
    mortarDryVolumeFactor: 0,
    mortarRatio: { cement: 0, sand: 0 },
  },
  plaster: {
    internal: {
      thicknessMm: 0,
      dryVolumeFactor: 0,
      ratio: { cement: 0, sand: 0 },
    },
    external: {
      thicknessMm: 0,
      dryVolumeFactor: 0,
      ratio: { cement: 0, sand: 0 },
    },
  },
  painting: {
    internalCoverageM2PerLitre: 0,
    externalCoverageM2PerLitre: 0,
    coats: 0,
  },
  labour: [],
};

function Field({
  label,
  value,
  onChange,
  step = "0.01",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={Number.isFinite(value) && value !== 0 ? value : ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="field-input"
      />
    </label>
  );
}

export default function SpecificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [settings, setSettings] = useState<Settings>(blank);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void params.then(({ id: value }) => setId(value));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}/settings`, { cache: "no-store" })
      .then(async (r) => {
        const d = (await r.json()) as Settings & { error?: string };
        if (!r.ok) throw new Error(d.error || "Unable to load settings");
        setSettings(d);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Unable to load settings");
      });
  }, [id]);

  const update = (path: string[], value: number) => {
    setSettings((current) => {
      const next = structuredClone(current);
      let target: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]] as Record<string, unknown>;
      }
      target[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateLabour = (key: string, value: number) => {
    setSettings((current) => ({
      ...current,
      labour: current.labour.map((item) =>
        item.key === key ? { ...item, rate: value } : item
      ),
    }));
  };

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const r = await fetch(`/api/projects/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const d = (await r.json()) as Settings & { error?: string };
      if (!r.ok) throw new Error(d.error || "Unable to save specifications.");
      setSettings(d);
      setMessage("Specifications saved. Costing will use these project settings.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save specifications.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <Link href={`/engineer/projects/${id}`} className="back-link">
          ← Back to Project
        </Link>
        <div className="page-kicker">Project configuration</div>
        <h1 className="page-title">Specifications & Labour</h1>
        <p className="page-subtitle">
          Set the engineering conversion rules and labour rates used to build this
          project&apos;s estimate. Values are project-specific and remain separate
          from the material master.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2>Concrete conversion</h2>
            <p>
              PCC and RCC mix proportions, dry-volume factor and cement bag volume.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="soft-card">
            <h3 className="font-semibold">PCC mix</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Field
                label="Cement"
                value={settings.concrete.pcc.cement}
                onChange={(v) => update(["concrete", "pcc", "cement"], v)}
              />
              <Field
                label="Sand"
                value={settings.concrete.pcc.sand}
                onChange={(v) => update(["concrete", "pcc", "sand"], v)}
              />
              <Field
                label="Aggregate"
                value={Number(settings.concrete.pcc.aggregate ?? 0)}
                onChange={(v) => update(["concrete", "pcc", "aggregate"], v)}
              />
            </div>
          </div>
          <div className="soft-card">
            <h3 className="font-semibold">RCC mix</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Field
                label="Cement"
                value={settings.concrete.rcc.cement}
                onChange={(v) => update(["concrete", "rcc", "cement"], v)}
              />
              <Field
                label="Sand"
                value={settings.concrete.rcc.sand}
                onChange={(v) => update(["concrete", "rcc", "sand"], v)}
              />
              <Field
                label="Aggregate"
                value={Number(settings.concrete.rcc.aggregate ?? 0)}
                onChange={(v) => update(["concrete", "rcc", "aggregate"], v)}
              />
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="Dry volume factor"
            value={settings.concrete.dryVolumeFactor}
            onChange={(v) => update(["concrete", "dryVolumeFactor"], v)}
          />
          <Field
            label="Cement bag volume (m³/bag)"
            value={settings.concrete.cementBagVolume}
            onChange={(v) => update(["concrete", "cementBagVolume"], v)}
          />
        </div>
      </section>

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2>Masonry</h2>
            <p>
              Brick and mortar conversion for foundation/plinth and superstructure
              brickwork.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <Field
            label="Bricks / m³"
            step="1"
            value={settings.masonry.bricksPerM3}
            onChange={(v) => update(["masonry", "bricksPerM3"], v)}
          />
          <Field
            label="Wet mortar / m³"
            value={settings.masonry.mortarWetVolumePerM3}
            onChange={(v) => update(["masonry", "mortarWetVolumePerM3"], v)}
          />
          <Field
            label="Dry mortar factor"
            value={settings.masonry.mortarDryVolumeFactor}
            onChange={(v) => update(["masonry", "mortarDryVolumeFactor"], v)}
          />
          <Field
            label="Cement ratio"
            value={settings.masonry.mortarRatio.cement}
            onChange={(v) => update(["masonry", "mortarRatio", "cement"], v)}
          />
          <Field
            label="Sand ratio"
            value={settings.masonry.mortarRatio.sand}
            onChange={(v) => update(["masonry", "mortarRatio", "sand"], v)}
          />
        </div>
      </section>

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2>Plaster & painting</h2>
            <p>
              Conversion settings for internal/external plaster and paint coverage.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="soft-card">
            <h3 className="font-semibold">Internal plaster</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field
                label="Thickness (mm)"
                value={settings.plaster.internal.thicknessMm}
                onChange={(v) => update(["plaster", "internal", "thicknessMm"], v)}
              />
              <Field
                label="Dry factor"
                value={settings.plaster.internal.dryVolumeFactor}
                onChange={(v) =>
                  update(["plaster", "internal", "dryVolumeFactor"], v)
                }
              />
              <Field
                label="Cement ratio"
                value={settings.plaster.internal.ratio.cement}
                onChange={(v) =>
                  update(["plaster", "internal", "ratio", "cement"], v)
                }
              />
              <Field
                label="Sand ratio"
                value={settings.plaster.internal.ratio.sand}
                onChange={(v) =>
                  update(["plaster", "internal", "ratio", "sand"], v)
                }
              />
            </div>
          </div>
          <div className="soft-card">
            <h3 className="font-semibold">External plaster</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field
                label="Thickness (mm)"
                value={settings.plaster.external.thicknessMm}
                onChange={(v) => update(["plaster", "external", "thicknessMm"], v)}
              />
              <Field
                label="Dry factor"
                value={settings.plaster.external.dryVolumeFactor}
                onChange={(v) =>
                  update(["plaster", "external", "dryVolumeFactor"], v)
                }
              />
              <Field
                label="Cement ratio"
                value={settings.plaster.external.ratio.cement}
                onChange={(v) =>
                  update(["plaster", "external", "ratio", "cement"], v)
                }
              />
              <Field
                label="Sand ratio"
                value={settings.plaster.external.ratio.sand}
                onChange={(v) =>
                  update(["plaster", "external", "ratio", "sand"], v)
                }
              />
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <Field
            label="Internal paint coverage (m²/L)"
            value={settings.painting.internalCoverageM2PerLitre}
            onChange={(v) =>
              update(["painting", "internalCoverageM2PerLitre"], v)
            }
          />
          <Field
            label="External paint coverage (m²/L)"
            value={settings.painting.externalCoverageM2PerLitre}
            onChange={(v) =>
              update(["painting", "externalCoverageM2PerLitre"], v)
            }
          />
          <Field
            label="Number of coats"
            step="1"
            value={settings.painting.coats}
            onChange={(v) => update(["painting", "coats"], v)}
          />
        </div>
      </section>

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2>Labour schedule</h2>
            <p>
              Enter rates only where your estimating method has a defined labour
              basis. Zero means not priced.
            </p>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Work category</th>
                <th>Unit</th>
                <th>Labour rate</th>
              </tr>
            </thead>
            <tbody>
              {settings.labour.map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  <td>{item.unit}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate || ""}
                      onChange={(e) =>
                        updateLabour(item.key, Number(e.target.value))
                      }
                      className="field-input max-w-xs"
                      placeholder="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Link href={`/engineer/projects/${id}`} className="secondary-button">
          Cancel
        </Link>
        <button
          onClick={() => void save()}
          disabled={saving}
          className="primary-button"
        >
          {saving ? "Saving…" : "Save specifications"}
        </button>
      </div>
    </div>
  );
}
