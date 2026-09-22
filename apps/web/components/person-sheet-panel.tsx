"use client";

import { useState } from "react";
import type { PersonSheetProjection } from "@z-world/contracts";
import { CHARACTERISTICS, SKILLS, PRIORITY_BLOCKS, PRIORITIES, POTENTIAL_PHRASES, copyKey } from "@z-world/catalogs";

const PRIORITY_OPTIONS = ["never", 1, 2, 3, 4, 5] as const;

export function PersonSheetPanel({
  sheet,
  onUpdatePriority,
}: {
  readonly sheet: PersonSheetProjection | null;
  readonly onUpdatePriority: (priorityId: string, value: (typeof PRIORITY_OPTIONS)[number]) => void;
}) {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);

  if (!sheet) {
    return (
      <aside className="z-panel z-scroll" style={{ padding: 12, height: "100%" }}>
        <p className="z-muted">Selecciona un protagonista para ver su ficha.</p>
      </aside>
    );
  }

  return (
    <aside className="z-panel z-scroll" style={{ padding: 12, height: "100%" }} aria-label="Ficha de persona">
      <h2 style={{ marginTop: 0 }}>
        {sheet.firstName} {sheet.lastName}
      </h2>
      <p className="z-muted">{sheet.ageYears} años · {copyKey(sheet.biography.professionKey)}</p>

      <section>
        <h3>Estado de llegada</h3>
        <ul>
          <li>{sheet.arrivalCondition.daysTravelled} días de marcha.</li>
          <li>{copyKey(sheet.arrivalCondition.fatigueDescriptionKey)}</li>
          <li>{copyKey(sheet.arrivalCondition.restDeficitDescriptionKey)}</li>
          <li>{copyKey(sheet.arrivalCondition.notableHardshipKey)}</li>
        </ul>
      </section>

      <section>
        <h3>Biografía</h3>
        <p>{copyKey(sheet.biography.originKey)}</p>
        <p>{copyKey(sheet.biography.experienceSummaryKey)}</p>
        <p className="z-muted">Aficiones: {copyKey(sheet.biography.hobbiesKey)}</p>
        <p>Fortalezas: {copyKey(sheet.biography.strengthsKey)}</p>
        <p>Limitaciones: {copyKey(sheet.biography.limitationsKey)}</p>
      </section>

      <section>
        <h3>Características (nivel actual, escala 0–10; media humana 4)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {CHARACTERISTICS.map((characteristic) => (
              <tr key={characteristic.id}>
                <td>{characteristic.nameEs}</td>
                <td style={{ textAlign: "right" }}>{sheet.characteristics[characteristic.id]}</td>
                <td className="z-muted" style={{ fontSize: 12, paddingLeft: 8 }}>
                  {POTENTIAL_PHRASES[sheet.potentialPhraseByCharacteristic[characteristic.id]]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Habilidades (nivel actual, escala 0–10)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {SKILLS.map((skill) => (
              <tr key={skill.id}>
                <td>{skill.nameEs}</td>
                <td style={{ textAlign: "right" }}>{sheet.skills[skill.id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="z-muted" style={{ fontSize: 12 }}>
          El nivel actual es lo único visible. El potencial real, el máximo oculto y el calibre nunca se muestran.
        </p>
      </section>

      <section>
        <h3>Prioridades (disposición futura, no capacidad ni tarea activa)</h3>
        {PRIORITY_BLOCKS.map((block) => (
          <div key={block.id} style={{ marginBottom: 4 }}>
            <button
              onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
              aria-expanded={expandedBlock === block.id}
              style={{ width: "100%", textAlign: "left" }}
            >
              {block.nameEs}
            </button>
            {expandedBlock === block.id && (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                <tbody>
                  {PRIORITIES.filter((p) => p.blockId === block.id).map((priority) => (
                    <tr key={priority.id}>
                      <td>{priority.nameEs}</td>
                      <td>
                        <select
                          value={String(sheet.priorities[priority.id])}
                          onChange={(event) => {
                            const raw = event.target.value;
                            const value = raw === "never" ? "never" : (Number(raw) as 1 | 2 | 3 | 4 | 5);
                            onUpdatePriority(priority.id, value);
                          }}
                          aria-label={`Prioridad de ${priority.nameEs}`}
                        >
                          {PRIORITY_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option === "never" ? "Nunca" : option}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </section>

      <section>
        <h3>Relaciones</h3>
        <ul>
          {sheet.relationships.map((relationship, index) => (
            <li key={`${relationship.withPersonId}-${index}`}>{copyKey(relationship.descriptionKey)}</li>
          ))}
        </ul>
        <p className="z-muted">{copyKey(sheet.sharedEventInterpretationKey)}</p>
      </section>

      <section>
        <h3>Pertenencias</h3>
        <ul>
          {sheet.possessions.map((item) => (
            <li key={item.id}>{copyKey(item.labelKey)}</li>
          ))}
        </ul>
      </section>

      {sheet.lastBlockReasonKey && (
        <p className="z-panel" style={{ padding: 8, borderColor: "var(--z-warning)" }}>
          {copyKey(sheet.lastBlockReasonKey)}
        </p>
      )}
    </aside>
  );
}
