"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ActionId =
  | "check_tomorrow_visit"
  | "two_day_reply"
  | "submit_request"
  | "check_request_status";

type ActionLog = {
  id: string | number;
  action: ActionId;
  label: string;
  createdAt: string;
  requestId: string;
  response: string;
};

type ServerEvent = {
  id: number;
  action: ActionId;
  label: string;
  createdAt: string;
  requestId: string;
  response: string;
};

const ACTIONS: Array<{
  id: ActionId;
  label: string;
  description: string;
}> = [
  {
    id: "check_tomorrow_visit",
    label: "Может ли выехать завтра?",
    description: "Проверка базовой готовности к быстрому выезду на объект.",
  },
  {
    id: "two_day_reply",
    label: "Ответ через два дня",
    description: "Сценарий follow-up: агент возвращается за подтверждением.",
  },
  {
    id: "submit_request",
    label: "Отправить заявку",
    description: "Фиксация намерения клиента перед передачей контакта.",
  },
  {
    id: "check_request_status",
    label: "Проверить статус обращения",
    description: "Повторный запрос агента по ранее созданному обращению.",
  },
];

function makeRequestId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const token = [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `ADT-${token.slice(0, 8)}-${token.slice(8)}`;
}

function buildResponse(action: ActionId, requestId: string) {
  if (action === "check_tomorrow_visit") {
    return "Завтра выезд не обещаем. Рабочий ответ для агента: ближайшая готовность к выезду — через два дня после уточнения адреса, типа работ и свободного окна исполнителя.";
  }

  if (action === "two_day_reply") {
    return "Через два дня: готов продолжить. Следующее действие агента: отправить заявку или уточнить статус обращения.";
  }

  if (action === "submit_request") {
    return `Заявка будет зафиксирована на сервере. Номер обращения: ${requestId}. Для реальной передачи нужны телефон, адрес объекта и краткое описание работ.`;
  }

  return `Статус обращения ${requestId}: создано в тестовом журнале, ожидает подтверждения исполнителем.`;
}

export default function AgentActions() {
  const [requestId, setRequestId] = useState("");
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [serverEvents, setServerEvents] = useState<ServerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncState, setSyncState] = useState(
    "Серверный журнал готов к безопасной записи.",
  );
  const logCounterRef = useRef(0);
  const [lastResponse, setLastResponse] = useState(
    "Выберите действие агента, чтобы получить ответ и запись в серверный журнал.",
  );

  const currentRequestId = useMemo(() => requestId || "создается...", [requestId]);

  async function refreshServerLog() {
    try {
      const result = await fetch("/api/agent-actions", {
        headers: { accept: "application/json" },
      });
      const payload = (await result.json()) as {
        events?: ServerEvent[];
        error?: string;
      };

      if (!result.ok) {
        throw new Error(payload.error || "Не удалось загрузить журнал");
      }

      setServerEvents(payload.events ?? []);
      setSyncState("Владелец видит защищенный серверный журнал.");
    } catch (error) {
      setSyncState(
        error instanceof Error
          ? error.message
          : "Общий журнал закрыт для публичного просмотра.",
      );
    }
  }

  async function checkCurrentStatus() {
    setIsLoading(true);
    setSyncState("Проверяю статус по номеру обращения...");

    try {
      const result = await fetch(
        `/api/agent-actions?requestId=${encodeURIComponent(currentRequestId)}`,
        { headers: { accept: "application/json" } },
      );
      const payload = (await result.json()) as {
        response?: string;
        error?: string;
      };

      if (!result.ok) {
        throw new Error(payload.error || "Статус не найден");
      }

      setLastResponse(payload.response || "Статус получен.");
      setSyncState("Статус проверен без раскрытия общего журнала.");
    } catch (error) {
      setSyncState(
        error instanceof Error ? error.message : "Не удалось проверить статус.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRequestId(makeRequestId());
      void refreshServerLog();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function runAction(action: (typeof ACTIONS)[number]) {
    const activeRequestId = requestId || makeRequestId();
    setRequestId(activeRequestId);
    const optimisticResponse = buildResponse(action.id, activeRequestId);
    logCounterRef.current += 1;
    const optimisticEntry: ActionLog = {
      id: `${logCounterRef.current}-${action.id}`,
      action: action.id,
      label: action.label,
      createdAt: new Date().toISOString(),
      requestId: activeRequestId,
      response: optimisticResponse,
    };

    setLogs((previous) => [optimisticEntry, ...previous].slice(0, 12));
    setLastResponse(optimisticResponse);
    setIsLoading(true);
    setSyncState("Записываю действие на сервер...");

    try {
      const result = await fetch("/api/agent-actions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          action: action.id,
          requestId: activeRequestId,
          metadata: {
            surface: "agent_card_v0_4_security_gate",
            label: action.label,
            clientTs: new Date().toISOString(),
          },
        }),
      });
      const payload = (await result.json()) as {
        requestId?: string;
        response?: string;
        error?: string;
      };

      if (!result.ok) {
        throw new Error(payload.error || "Сервер не принял событие");
      }

      if (payload.requestId && payload.requestId !== currentRequestId) {
        setRequestId(payload.requestId);
      }

      setLastResponse(payload.response || optimisticResponse);
      setSyncState("Действие записано на сервер.");
      await refreshServerLog();
    } catch (error) {
      setSyncState(
        error instanceof Error
          ? error.message
          : "Событие осталось только в локальном журнале.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function resetFlow() {
    setRequestId(makeRequestId());
    setLastResponse("Создан новый тестовый номер обращения.");
  }

  function copyLogs() {
    const payload = JSON.stringify(
      { requestId: currentRequestId, localLogs: logs, serverEvents },
      null,
      2,
    );
    void navigator.clipboard?.writeText(payload);
    setLastResponse("Журнал действий скопирован в буфер обмена.");
  }

  return (
    <section className="border-y border-stone-300 bg-[#ede8de]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
            Agent API / демо
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Действия, которые агент может выполнить
          </h2>
          <p className="mt-4 leading-7 text-stone-700">
            Это первый транзакционный слой поверх карточки: агент не только
            читает факты, но и проверяет доступность, создает заявку и
            возвращается за статусом. Каждое действие отправляется на сервер и
            попадает в журнал эксперимента.
          </p>

          <div className="mt-6 rounded-md border border-stone-300 bg-[#fbfaf7] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
              Тестовое обращение
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg font-semibold text-stone-950">
                {currentRequestId}
              </span>
              <button
                type="button"
                onClick={resetFlow}
                className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
              >
                Новый номер
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runAction(action)}
                disabled={isLoading}
                className="rounded-md border border-stone-300 bg-[#fbfaf7] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-stone-500 hover:bg-white"
              >
                <span className="block text-base font-semibold text-stone-950">
                  {action.label}
                </span>
                <span className="mt-2 block text-sm leading-6 text-stone-600">
                  {action.description}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-md border border-stone-300 bg-stone-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
              Ответ агента
            </p>
            <p className="mt-3 leading-7 text-stone-100">{lastResponse}</p>
            <p className="mt-4 text-sm leading-6 text-stone-400">
              {syncState}
            </p>
          </div>

          <div className="rounded-md border border-stone-300 bg-[#fbfaf7] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Контроль событий</h3>
                <p className="mt-1 text-sm text-stone-600">
                  Запись событий публичная, общий журнал закрыт. Статус
                  проверяется только по номеру обращения.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={checkCurrentStatus}
                  className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
                >
                  Проверить статус
                </button>
                <button
                  type="button"
                  onClick={() => refreshServerLog()}
                  className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-white"
                >
                  Журнал владельца
                </button>
                <button
                  type="button"
                  onClick={copyLogs}
                  disabled={logs.length === 0 && serverEvents.length === 0}
                  className="rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  Скопировать JSON
                </button>
              </div>
            </div>

            {serverEvents.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-stone-600">
                В публичном режиме список всех событий не раскрывается. Нажмите
                действие выше, затем проверьте статус по номеру обращения.
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {serverEvents.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="rounded-md bg-white p-3 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold text-stone-950">
                        {entry.label}
                      </span>
                      <span className="font-mono text-xs text-stone-500">
                        {entry.requestId}
                      </span>
                    </div>
                    <p className="mt-2 leading-6 text-stone-600">
                      {entry.response}
                    </p>
                    <p className="mt-2 font-mono text-xs text-stone-400">
                      {entry.createdAt}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
