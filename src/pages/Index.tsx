import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

type Theme = "dark" | "light";

const DELETION_CATEGORIES = [
  {
    id: "spaces",
    label: "Пробелы и отступы",
    items: [
      { id: "all_spaces", label: "Все пробелы" },
      { id: "regular_spaces", label: "Обычные пробелы" },
      { id: "nbsp", label: "Неразрывные пробелы" },
      { id: "leading_spaces", label: "Пробелы в начале" },
      { id: "trailing_spaces", label: "Пробелы в конце" },
      { id: "edge_spaces", label: "Пробелы по краям" },
      { id: "extra_spaces", label: "Лишние пробелы" },
    ],
  },
  {
    id: "lines",
    label: "Переносы строк",
    items: [
      { id: "all_newlines", label: "Все переносы" },
      { id: "empty_lines", label: "Пустые строки" },
      { id: "double_newlines", label: "Двойные переносы" },
      { id: "leading_newlines", label: "Переносы в начале" },
    ],
  },
  {
    id: "punctuation",
    label: "Пунктуация",
    items: [
      { id: "commas", label: "Запятые" },
      { id: "periods", label: "Точки" },
      { id: "semicolons", label: "Точки с запятой" },
      { id: "exclamation", label: "Восклицательные знаки" },
      { id: "question", label: "Вопросительные знаки" },
    ],
  },
  {
    id: "numbers",
    label: "Цифры и числа",
    items: [
      { id: "all_digits", label: "Все цифры" },
      { id: "standalone_numbers", label: "Отдельные числа" },
      { id: "leading_zeros", label: "Ведущие нули" },
    ],
  },
  {
    id: "special",
    label: "Спецсимволы",
    items: [
      { id: "html_tags", label: "HTML-теги" },
      { id: "brackets", label: "Скобки" },
      { id: "slashes", label: "Слэши" },
      { id: "at_signs", label: "Символы @" },
      { id: "hash_signs", label: "Символы #" },
    ],
  },
  {
    id: "quotes",
    label: "Кавычки",
    items: [
      { id: "all_quotes", label: "Все кавычки" },
      { id: "double_quotes", label: "Двойные кавычки" },
      { id: "single_quotes", label: "Одинарные кавычки" },
      { id: "guillemets", label: "«Ёлочки»" },
    ],
  },
  {
    id: "dashes",
    label: "Тире и дефисы",
    items: [
      { id: "all_dashes", label: "Все виды" },
      { id: "hyphens", label: "Дефисы" },
      { id: "em_dash", label: "Длинное тире" },
      { id: "en_dash", label: "Среднее тире" },
    ],
  },
  {
    id: "urls",
    label: "Ссылки и URL",
    items: [
      { id: "urls", label: "URL-адреса" },
      { id: "emails", label: "E-mail адреса" },
      { id: "hashtags", label: "Хэштеги" },
    ],
  },
  {
    id: "formatting",
    label: "Форматирование",
    items: [
      { id: "tabs", label: "Табуляции" },
      { id: "markdown", label: "Markdown-разметка" },
      { id: "duplicates", label: "Дублирующиеся слова" },
    ],
  },
  {
    id: "letters",
    label: "Буквы",
    items: [
      { id: "latin_letters", label: "Латинские буквы" },
      { id: "cyrillic_letters", label: "Кириллические буквы" },
      { id: "accents", label: "Знаки ударения" },
    ],
  },
];

function applyDeletions(text: string, selected: Set<string>): string {
  let result = text;
  if (selected.has("all_spaces")) result = result.replace(/\s/g, "");
  else {
    if (selected.has("regular_spaces")) result = result.replace(/ /g, "");
    if (selected.has("nbsp")) result = result.replace(/\u00a0/g, "");
    if (selected.has("leading_spaces")) result = result.replace(/^ +/gm, "");
    if (selected.has("trailing_spaces")) result = result.replace(/ +$/gm, "");
    if (selected.has("edge_spaces")) result = result.replace(/^\s+|\s+$/gm, "");
    if (selected.has("extra_spaces")) result = result.replace(/ {2,}/g, " ");
  }
  if (selected.has("all_newlines")) result = result.replace(/\n/g, "");
  else {
    if (selected.has("empty_lines")) result = result.replace(/^\s*[\r\n]/gm, "");
    if (selected.has("double_newlines")) result = result.replace(/\n{2,}/g, "\n");
    if (selected.has("leading_newlines")) result = result.replace(/^\n+/, "");
  }
  if (selected.has("commas")) result = result.replace(/,/g, "");
  if (selected.has("periods")) result = result.replace(/\./g, "");
  if (selected.has("semicolons")) result = result.replace(/;/g, "");
  if (selected.has("exclamation")) result = result.replace(/!/g, "");
  if (selected.has("question")) result = result.replace(/\?/g, "");
  if (selected.has("all_digits")) result = result.replace(/\d/g, "");
  else {
    if (selected.has("standalone_numbers")) result = result.replace(/\b\d+\b/g, "");
    if (selected.has("leading_zeros")) result = result.replace(/\b0+(\d)/g, "$1");
  }
  if (selected.has("html_tags")) result = result.replace(/<[^>]*>/g, "");
  if (selected.has("brackets")) result = result.replace(/[()[\]{}]/g, "");
  if (selected.has("slashes")) result = result.replace(/[/\\]/g, "");
  if (selected.has("at_signs")) result = result.replace(/@/g, "");
  if (selected.has("hash_signs")) result = result.replace(/#/g, "");
  if (selected.has("all_quotes")) result = result.replace(/["'«»„"]/g, "");
  else {
    if (selected.has("double_quotes")) result = result.replace(/"/g, "");
    if (selected.has("single_quotes")) result = result.replace(/'/g, "");
    if (selected.has("guillemets")) result = result.replace(/[«»]/g, "");
  }
  if (selected.has("all_dashes")) result = result.replace(/[-–—]/g, "");
  else {
    if (selected.has("hyphens")) result = result.replace(/-/g, "");
    if (selected.has("em_dash")) result = result.replace(/—/g, "");
    if (selected.has("en_dash")) result = result.replace(/–/g, "");
  }
  if (selected.has("urls")) result = result.replace(/https?:\/\/[^\s]+/g, "");
  if (selected.has("emails")) result = result.replace(/[\w.-]+@[\w.-]+\.\w+/g, "");
  if (selected.has("hashtags")) result = result.replace(/#\w+/g, "");
  if (selected.has("tabs")) result = result.replace(/\t/g, "");
  if (selected.has("markdown")) result = result.replace(/[*_`#~>]/g, "");
  if (selected.has("duplicates"))
    result = result
      .split(" ")
      .filter((w, i, a) => a.indexOf(w) === i)
      .join(" ");
  if (selected.has("latin_letters")) result = result.replace(/[a-zA-Z]/g, "");
  if (selected.has("cyrillic_letters")) result = result.replace(/[а-яёА-ЯЁ]/g, "");
  if (selected.has("accents")) result = result.replace(/[\u0300-\u036f]/g, "");
  return result;
}

function Logo({ dark }: { dark: boolean }) {
  return (
    <div className="flex justify-center items-end select-none">
      <div className="tracking-[2.3px] font-bold text-[1.75rem] leading-none">
        <span style={{ color: "#415D43" }}>{`{`}</span>
        <span style={{ color: dark ? "#ffffff" : "#1a1a1a" }}>T</span>
        <span style={{ color: "#415D43" }}>{`}`}</span>
      </div>
      <span
        className="font-bold text-[1.125rem] tracking-[1.3px] leading-none mb-[2px]"
        style={{ color: dark ? "#ffffff" : "#1a1a1a" }}
      >
        extune
      </span>
    </div>
  );
}

export default function Index() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [caseMode, setCaseMode] = useState<"upper" | "lower" | "none">("none");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [deletions, setDeletions] = useState<Set<string>>(new Set());
  const [removeByKey, setRemoveByKey] = useState("");
  const [renameFrom, setRenameFrom] = useState("");
  const [renameTo, setRenameTo] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [filterHistory, setFilterHistory] = useState<Array<{ caseMode: "upper" | "lower" | "none"; findText: string; replaceText: string; deletions: Set<string> }>>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const saveFilterSnapshot = () => {
    setFilterHistory((prev) => [...prev.slice(-19), { caseMode, findText, replaceText, deletions: new Set(deletions) }]);
  };

  const undoFilter = () => {
    if (filterHistory.length === 0) return;
    const prev = filterHistory[filterHistory.length - 1];
    setCaseMode(prev.caseMode);
    setFindText(prev.findText);
    setReplaceText(prev.replaceText);
    setDeletions(prev.deletions);
    setFilterHistory((h) => h.slice(0, -1));
    showToast("Отменено");
  };

  const processText = useCallback(
    (text: string) => {
      let result = text;
      if (caseMode === "upper") result = result.toUpperCase();
      if (caseMode === "lower") result = result.toLowerCase();
      result = applyDeletions(result, deletions);
      return result;
    },
    [caseMode, deletions]
  );

  useEffect(() => {
    setOutput(processText(input));
  }, [input, processText]);

  const applyFunction = (fn: string) => {
    let result = input;
    if (fn === "capitalize") {
      result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
    } else if (fn === "title") {
      result = result.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (fn === "invert") {
      result = result
        .split("")
        .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
        .join("");
    } else if (fn === "sentence") {
      result = result
        .split(". ")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(". ");
    } else if (fn === "camel") {
      result = result
        .split(/\s+/)
        .map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("");
    } else if (fn === "snake") {
      result = result.toLowerCase().replace(/\s+/g, "_");
    }
    setInput(result);
    showToast("Применено");
  };

  const doReplace = () => {
    if (!findText) return;
    saveFilterSnapshot();
    const result = input.split(findText).join(replaceText);
    setInput(result);
    showToast("Замена выполнена");
  };

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    showToast("Скопировано!");
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleResetText = useCallback(() => {
    setInput("");
    showToast("Текст очищен");
    inputRef.current?.focus();
  }, []);

  const handleResetFilters = useCallback(() => {
    setCaseMode("none");
    setFindText("");
    setReplaceText("");
    setDeletions(new Set());
    showToast("Фильтры сброшены");
  }, []);

  const handleReset = useCallback(() => {
    setInput("");
    setCaseMode("none");
    setFindText("");
    setReplaceText("");
    setDeletions(new Set());
    showToast("Сброшено");
    inputRef.current?.focus();
  }, []);

  const toggleDeletion = (id: string) => {
    saveFilterSnapshot();
    setDeletions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeCaseMode = (val: "upper" | "lower" | "none") => {
    saveFilterSnapshot();
    setCaseMode(val);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "Enter") {
        e.preventDefault();
        showToast("Текст обработан");
      }
      if (ctrl && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleCopy();
      }
      if (ctrl && e.key === "r") {
        e.preventDefault();
        handleReset();
      }
      if (ctrl && e.key === "u") {
        e.preventDefault();
        setCaseMode("upper");
        showToast("Верхний регистр");
      }
      if (ctrl && e.key === "l") {
        e.preventDefault();
        setCaseMode("lower");
        showToast("Нижний регистр");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCopy, handleReset]);

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#0f1117] text-[#e8eaf0]" : "bg-[#f4f5f7] text-[#1a1d26]"
      }`}
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
              isDark ? "bg-[#2a7fff] text-white" : "bg-[#1d6ef5] text-white"
            }`}
          >
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-sm ${
          isDark
            ? "bg-[#0f1117]/90 border-[#1e2230]"
            : "bg-[#f4f5f7]/90 border-[#dde0e8]"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Logo dark={isDark} />

          <div className="flex items-center gap-3">
            <div
              className={`hidden md:flex items-center gap-3 text-xs ${
                isDark ? "text-[#4b5265]" : "text-[#9ca3af]"
              }`}
            >
              {[
                { key: "Ctrl+R", desc: "сброс" },
                { key: "Ctrl+⇧+C", desc: "копировать" },
                { key: "Ctrl+U", desc: "ВЕРХНИЙ" },
              ].map((sc) => (
                <span key={sc.key} className="flex items-center gap-1.5">
                  <kbd
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      isDark
                        ? "border-[#2a2f3d] bg-[#1a1f2e] text-[#6b7280]"
                        : "border-[#d1d5db] bg-white text-[#6b7280]"
                    }`}
                  >
                    {sc.key}
                  </kbd>
                  <span>{sc.desc}</span>
                </span>
              ))}
            </div>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                isDark
                  ? "bg-[#1a1f2e] hover:bg-[#222840] text-[#8891a8]"
                  : "bg-white hover:bg-[#eff0f3] text-[#6b7280] border border-[#e5e7eb]"
              }`}
            >
              <Icon name={isDark ? "Sun" : "Moon"} size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        {/* Text Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-sm ${
              isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"
            }`}
          >
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b ${
                isDark ? "border-[#1e2230]" : "border-[#f0f1f3]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="PenLine" size={14} className={isDark ? "text-[#4b5265]" : "text-[#9ca3af]"} />
                <span className={`text-xs font-medium ${isDark ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>
                  Исходный текст
                </span>
                {input && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${isDark ? "bg-[#1e2230] text-[#4b5265]" : "bg-[#f3f4f6] text-[#9ca3af]"}`}>
                    {input.length} симв.
                  </span>
                )}
              </div>
              <button
                onClick={handleResetText}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  isDark
                    ? "text-[#6b7280] hover:text-[#e8eaf0] hover:bg-[#1e2230]"
                    : "text-[#9ca3af] hover:text-[#1a1d26] hover:bg-[#f3f4f6]"
                }`}
              >
                <Icon name="Trash2" size={12} />
                Очистить
              </button>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Вставьте или введите текст здесь…"
              className={`w-full h-52 px-4 py-3 text-sm resize-none outline-none leading-relaxed ${
                isDark
                  ? "bg-[#141720] text-[#e8eaf0] placeholder:text-[#2e3447]"
                  : "bg-white text-[#1a1d26] placeholder:text-[#c5c8d0]"
              }`}
            />
          </div>

          {/* Output */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-sm ${
              isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"
            }`}
          >
            <div
              className={`flex items-center justify-between px-4 py-2.5 border-b ${
                isDark ? "border-[#1e2230]" : "border-[#f0f1f3]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={14} className={isDark ? "text-[#2a7fff]" : "text-[#1d6ef5]"} />
                <span className={`text-xs font-medium ${isDark ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>
                  Результат
                </span>
                {output && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md ${isDark ? "bg-[#1e2230] text-[#4b5265]" : "bg-[#f3f4f6] text-[#9ca3af]"}`}>
                    {output.length} симв.
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                  copied
                    ? "bg-[#22c55e] text-white"
                    : isDark
                    ? "bg-[#2a7fff] text-white hover:bg-[#1a6fef]"
                    : "bg-[#1d6ef5] text-white hover:bg-[#1557d4]"
                }`}
              >
                <Icon name={copied ? "Check" : "Copy"} size={12} />
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Результат появится здесь…"
              className={`w-full h-52 px-4 py-3 text-sm resize-none outline-none leading-relaxed ${
                isDark
                  ? "bg-[#141720] text-[#e8eaf0] placeholder:text-[#2e3447]"
                  : "bg-white text-[#1a1d26] placeholder:text-[#c5c8d0]"
              }`}
            />
          </div>
        </div>

        {/* Panels Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="SlidersHorizontal" size={13} className={isDark ? "text-[#4b5265]" : "text-[#9ca3af]"} />
            <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>
              Настройки
            </span>
            {(caseMode !== "none" || findText || deletions.size > 0) && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${isDark ? "bg-[#2a7fff]/15 text-[#2a7fff]" : "bg-[#1d6ef5]/10 text-[#1d6ef5]"}`}>
                {[caseMode !== "none" ? 1 : 0, findText ? 1 : 0, deletions.size].reduce((a, b) => a + b, 0)} активно
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={undoFilter}
              disabled={filterHistory.length === 0}
              title="Отменить последнее изменение фильтра"
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all border ${
                filterHistory.length > 0
                  ? isDark
                    ? "text-[#8891a8] hover:bg-[#1a1f2e] border-[#2e3447]"
                    : "text-[#6b7280] hover:bg-[#f3f4f6] border-[#e5e7eb]"
                  : isDark
                    ? "text-[#3e4560] border-transparent cursor-not-allowed"
                    : "text-[#d1d5db] border-transparent cursor-not-allowed"
              }`}
            >
              <Icon name="Undo2" size={12} />
              {filterHistory.length > 0 && <span className={`text-[10px] ${isDark ? "text-[#3e4560]" : "text-[#c5c8d0]"}`}>{filterHistory.length}</span>}
            </button>
            <button
              onClick={handleResetFilters}
              disabled={caseMode === "none" && !findText && deletions.size === 0}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                caseMode !== "none" || findText || deletions.size > 0
                  ? isDark
                    ? "text-[#f87171] hover:bg-[#2a1515] border border-[#f87171]/20"
                    : "text-[#ef4444] hover:bg-[#fef2f2] border border-[#ef4444]/20"
                  : isDark
                    ? "text-[#3e4560] border border-transparent cursor-not-allowed"
                    : "text-[#d1d5db] border border-transparent cursor-not-allowed"
              }`}
            >
              <Icon name="FilterX" size={12} />
              Сбросить фильтры
            </button>
          </div>
        </div>

        {/* Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Регистр */}
          <div className={`rounded-2xl border p-4 shadow-sm ${isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? "bg-[#1a2540]" : "bg-[#eff5ff]"}`}>
                <Icon name="CaseSensitive" size={12} className={isDark ? "text-[#2a7fff]" : "text-[#1d6ef5]"} />
              </div>
              <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>Регистр</span>
            </div>
            <div className="space-y-1.5">
              {[
                { value: "upper", label: "Верхний регистр", badge: "AA" },
                { value: "lower", label: "Нижний регистр", badge: "aa" },
                { value: "none", label: "Без изменений", badge: "—" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                    caseMode === opt.value
                      ? isDark ? "bg-[#1a2540] border-[#2a7fff]/40" : "bg-[#eff5ff] border-[#1d6ef5]/30"
                      : isDark ? "hover:bg-[#1a1f2e] border-transparent" : "hover:bg-[#f9fafb] border-transparent"
                  }`}
                >
                  <input type="radio" name="case" value={opt.value} checked={caseMode === opt.value} onChange={() => changeCaseMode(opt.value as typeof caseMode)} className="sr-only" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${caseMode === opt.value ? "border-[#2a7fff] bg-[#2a7fff]" : isDark ? "border-[#2e3447]" : "border-[#d1d5db]"}`}>
                    {caseMode === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`font-mono text-xs w-5 text-center ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>{opt.badge}</span>
                  <span className="text-xs">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Функции */}
          <div className={`rounded-2xl border p-4 shadow-sm ${isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? "bg-[#162a1e]" : "bg-[#f0fdf4]"}`}>
                <Icon name="Wand2" size={12} className={isDark ? "text-[#22c55e]" : "text-[#16a34a]"} />
              </div>
              <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>Функции</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { fn: "capitalize", label: "Капитализация", icon: "WholeWord" },
                { fn: "title", label: "Каждое слово", icon: "Heading" },
                { fn: "invert", label: "Инвертировать", icon: "ArrowUpDown" },
                { fn: "sentence", label: "По предложениям", icon: "AlignLeft" },
                { fn: "camel", label: "camelCase", icon: "Code2" },
                { fn: "snake", label: "snake_case", icon: "Minus" },
              ].map((item) => (
                <button
                  key={item.fn}
                  onClick={() => applyFunction(item.fn)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs transition-all text-left ${
                    isDark
                      ? "bg-[#1a1f2e] hover:bg-[#162a1e] hover:text-[#22c55e] text-[#8891a8] border border-transparent hover:border-[#22c55e]/20"
                      : "bg-[#f3f4f6] hover:bg-[#f0fdf4] hover:text-[#16a34a] text-[#6b7280] border border-transparent hover:border-[#16a34a]/20"
                  }`}
                >
                  <Icon name={item.icon} size={11} />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className={`mt-3 pt-3 border-t space-y-2 ${isDark ? "border-[#1e2230]" : "border-[#f0f1f3]"}`}>
              {/* RemoveByKey */}
              <div className={`flex items-center gap-1.5 rounded-xl border overflow-hidden ${isDark ? "border-[#2e3447] bg-[#1a1f2e]" : "border-[#e5e7eb] bg-[#f9fafb]"}`}>
                <span className={`pl-2.5 text-[9px] font-bold tracking-wider whitespace-nowrap ${isDark ? "text-[#3e4560]" : "text-[#c5c8d0]"}`}>KEY</span>
                <input
                  value={removeByKey}
                  onChange={(e) => setRemoveByKey(e.target.value)}
                  placeholder="RemoveByKey…"
                  className={`flex-1 min-w-0 py-2 text-xs outline-none bg-transparent ${isDark ? "text-[#e8eaf0] placeholder:text-[#3e4560]" : "text-[#1a1d26] placeholder:text-[#c5c8d0]"}`}
                />
                {removeByKey && (
                  <button onClick={() => setRemoveByKey("")} className={`p-1.5 transition-colors ${isDark ? "text-[#3e4560] hover:text-[#8891a8]" : "text-[#d1d5db] hover:text-[#9ca3af]"}`}>
                    <Icon name="X" size={10} />
                  </button>
                )}
                <button
                  disabled={!removeByKey}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-medium transition-all ${
                    removeByKey
                      ? isDark ? "text-[#22c55e] hover:bg-[#162a1e]" : "text-[#16a34a] hover:bg-[#f0fdf4]"
                      : isDark ? "text-[#3e4560] cursor-not-allowed" : "text-[#d1d5db] cursor-not-allowed"
                  }`}
                >
                  <Icon name="Scissors" size={11} />
                  Удалить
                </button>
              </div>

              {/* Rename */}
              <div className={`flex items-center gap-1.5 rounded-xl border overflow-hidden ${isDark ? "border-[#2e3447] bg-[#1a1f2e]" : "border-[#e5e7eb] bg-[#f9fafb]"}`}>
                <span className={`pl-2.5 text-[9px] font-bold tracking-wider whitespace-nowrap ${isDark ? "text-[#3e4560]" : "text-[#c5c8d0]"}`}>A→B</span>
                <input
                  value={renameFrom}
                  onChange={(e) => setRenameFrom(e.target.value)}
                  placeholder="Было"
                  className={`w-[72px] min-w-0 py-2 text-xs outline-none bg-transparent ${isDark ? "text-[#e8eaf0] placeholder:text-[#3e4560]" : "text-[#1a1d26] placeholder:text-[#c5c8d0]"}`}
                />
                <Icon name="ArrowRight" size={10} className={isDark ? "text-[#3e4560]" : "text-[#d1d5db]"} />
                <input
                  value={renameTo}
                  onChange={(e) => setRenameTo(e.target.value)}
                  placeholder="Стало"
                  className={`flex-1 min-w-0 py-2 text-xs outline-none bg-transparent ${isDark ? "text-[#e8eaf0] placeholder:text-[#3e4560]" : "text-[#1a1d26] placeholder:text-[#c5c8d0]"}`}
                />
                {(renameFrom || renameTo) && (
                  <button onClick={() => { setRenameFrom(""); setRenameTo(""); }} className={`p-1.5 transition-colors ${isDark ? "text-[#3e4560] hover:text-[#8891a8]" : "text-[#d1d5db] hover:text-[#9ca3af]"}`}>
                    <Icon name="X" size={10} />
                  </button>
                )}
                <button
                  disabled={!renameFrom}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2 text-xs font-medium transition-all ${
                    renameFrom
                      ? isDark ? "text-[#22c55e] hover:bg-[#162a1e]" : "text-[#16a34a] hover:bg-[#f0fdf4]"
                      : isDark ? "text-[#3e4560] cursor-not-allowed" : "text-[#d1d5db] cursor-not-allowed"
                  }`}
                >
                  <Icon name="Pencil" size={11} />
                  Rename
                </button>
              </div>
            </div>
          </div>

          {/* Замена */}
          <div className={`rounded-2xl border p-4 shadow-sm ${isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? "bg-[#2a1f0e]" : "bg-[#fffbeb]"}`}>
                <Icon name="Replace" size={12} className={isDark ? "text-[#f59e0b]" : "text-[#d97706]"} />
              </div>
              <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>Замена</span>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-wider ${isDark ? "text-[#3e4560]" : "text-[#d1d5db]"}`}>НАЙТИ</span>
                <input
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Текст для поиска"
                  className={`w-full pl-[52px] pr-3 py-2.5 rounded-xl text-xs outline-none border transition-colors ${
                    isDark
                      ? "bg-[#1a1f2e] border-[#2e3447] text-[#e8eaf0] placeholder:text-[#3e4560] focus:border-[#f59e0b]/50"
                      : "bg-[#f9fafb] border-[#e5e7eb] text-[#1a1d26] placeholder:text-[#c5c8d0] focus:border-[#d97706]/40"
                  }`}
                />
              </div>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-wider ${isDark ? "text-[#3e4560]" : "text-[#d1d5db]"}`}>НА</span>
                <input
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Заменить на"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs outline-none border transition-colors ${
                    isDark
                      ? "bg-[#1a1f2e] border-[#2e3447] text-[#e8eaf0] placeholder:text-[#3e4560] focus:border-[#f59e0b]/50"
                      : "bg-[#f9fafb] border-[#e5e7eb] text-[#1a1d26] placeholder:text-[#c5c8d0] focus:border-[#d97706]/40"
                  }`}
                />
              </div>
              <button
                onClick={doReplace}
                disabled={!findText}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  findText
                    ? "bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-sm"
                    : isDark ? "bg-[#1e2230] text-[#3e4560] cursor-not-allowed" : "bg-[#f3f4f6] text-[#c5c8d0] cursor-not-allowed"
                }`}
              >
                <Icon name="RefreshCw" size={12} />
                Выполнить замену
              </button>
              {findText && (
                <p className={`text-[10px] text-center ${isDark ? "text-[#3e4560]" : "text-[#c5c8d0]"}`}>
                  Вхождений: {input.split(findText).length - 1}
                </p>
              )}
            </div>
          </div>

          {/* Удаление */}
          <div className={`rounded-2xl border shadow-sm flex flex-col ${isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"}`}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isDark ? "bg-[#2a1515]" : "bg-[#fef2f2]"}`}>
                  <Icon name="Eraser" size={12} className={isDark ? "text-[#f87171]" : "text-[#ef4444]"} />
                </div>
                <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>Удаление</span>
              </div>
              {deletions.size > 0 && (
                <button
                  onClick={() => setDeletions(new Set())}
                  className={`text-[10px] px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${isDark ? "text-[#f87171] hover:bg-[#2a1515]" : "text-[#ef4444] hover:bg-[#fef2f2]"}`}
                >
                  <Icon name="X" size={10} />
                  Сбросить ({deletions.size})
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3" style={{ maxHeight: "220px" }}>
              {DELETION_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? "text-[#3e4560]" : "text-[#c5c8d0]"}`}>
                    {cat.label}
                  </p>
                  <div className="space-y-0.5">
                    {cat.items.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          deletions.has(item.id)
                            ? isDark ? "bg-[#2a1515]" : "bg-[#fef2f2]"
                            : isDark ? "hover:bg-[#1a1f2e]" : "hover:bg-[#f9fafb]"
                        }`}
                        onClick={() => toggleDeletion(item.id)}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${deletions.has(item.id) ? "bg-[#f87171] border-[#f87171]" : isDark ? "border-[#2e3447]" : "border-[#d1d5db]"}`}>
                          {deletions.has(item.id) && <Icon name="Check" size={8} className="text-white" />}
                        </div>
                        <span className="text-xs select-none">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className={`rounded-2xl border px-5 py-3.5 flex items-center gap-6 flex-wrap ${isDark ? "bg-[#141720] border-[#1e2230]" : "bg-white border-[#e5e7eb]"}`}>
          <div className="flex items-center gap-2">
            <Icon name="Keyboard" size={13} className={isDark ? "text-[#4b5265]" : "text-[#9ca3af]"} />
            <span className={`text-xs font-semibold tracking-widest uppercase ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>Горячие клавиши</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              { keys: "Ctrl+R", desc: "Сбросить всё" },
              { keys: "Ctrl+⇧+C", desc: "Копировать результат" },
              { keys: "Ctrl+U", desc: "Верхний регистр" },
              { keys: "Ctrl+L", desc: "Нижний регистр" },
              { keys: "Ctrl+Enter", desc: "Применить" },
            ].map((sc) => (
              <span key={sc.keys} className="flex items-center gap-1.5">
                <kbd className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${isDark ? "border-[#2e3447] bg-[#1a1f2e] text-[#6b7280]" : "border-[#e5e7eb] bg-[#f9fafb] text-[#6b7280]"}`}>
                  {sc.keys}
                </kbd>
                <span className={`text-xs ${isDark ? "text-[#4b5265]" : "text-[#9ca3af]"}`}>{sc.desc}</span>
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}