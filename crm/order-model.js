/** Этапы создания песни (творческий прогресс в заказе) */

window.CreativeStages = [

  { key: "received", label: "Получена заявка" },

  { key: "discussion", label: "Обсуждение" },

  { key: "lyrics", label: "Текст песни" },

  { key: "arrangement", label: "Музыка и аранжировка" },

  { key: "approval", label: "Согласование" },

  { key: "done", label: "Готовая работа" },

];



window.createEmptyCreative = function () {

  return {

    songTitle: "",

    mainIdea: "",

    mood: "",

    musicStyle: "",

    keyPhrases: "",

    additionalWishes: "",

    workNotes: "",

    draftLyrics: "",

    finalLyrics: "",

  };

};



window.createEmptyOrderFiles = function () {

  return {

    demoUrl: "",

    finalUrl: "",

    additionalFiles: [],

  };

};



window.createEmptyOrderStages = function () {

  return {

    received: true,

    discussion: false,

    lyrics: false,

    arrangement: false,

    approval: false,

    done: false,

  };

};



window.enrichOrder = function (order) {

  const o = { ...order };

  o.creative = { ...createEmptyCreative(), ...(o.creative || {}) };

  o.files = {

    ...createEmptyOrderFiles(),

    ...(o.files || {}),

    additionalFiles: Array.isArray(o.files?.additionalFiles) ? o.files.additionalFiles : [],

  };

  o.stages = { ...createEmptyOrderStages(), ...(o.stages || {}) };

  o.internalNotes = Array.isArray(o.internalNotes) ? o.internalNotes : [];

  o.activityLog = Array.isArray(o.activityLog) ? o.activityLog : [];

  o.paymentStatus = o.paymentStatus || window.PaymentStatus?.UNPAID || "UNPAID";

  return o;

};



/** Глубокое слияние патча заказа — не теряет вложенные поля */

window.mergeOrderPatch = function (existing, patch) {

  const base = existing || {};

  const next = {

    ...base,

    ...patch,

    updatedAt: new Date().toISOString(),

  };



  if (patch.creative) {

    next.creative = { ...(base.creative || {}), ...patch.creative };

  }

  if (patch.files) {

    next.files = {

      ...(base.files || {}),

      ...patch.files,

      additionalFiles:

        patch.files.additionalFiles !== undefined

          ? patch.files.additionalFiles

          : base.files?.additionalFiles || [],

    };

  }

  if (patch.stages) {

    next.stages = { ...(base.stages || {}), ...patch.stages };

  }

  if (patch.internalNotes !== undefined) {

    next.internalNotes = patch.internalNotes;

  }

  if (patch.activityLog !== undefined) {

    next.activityLog = patch.activityLog;

  }



  return next;

};



window.collectOrderFormData = function (form) {

  const d = window.AdminUI.readForm(form);

  const creative = {};

  Object.keys(d).forEach((k) => {

    if (k.startsWith("creative_") && k !== "creative_finalLyrics") {

      creative[k.replace("creative_", "")] = d[k];

    }

  });

  const stages = {};

  CreativeStages.forEach((s) => {

    stages[s.key] = !!form.querySelector(`[name="stage_${s.key}"]`)?.checked;

  });

  const payload = {

    name: d.name || "",

    contact: d.contact || "",

    category: d.category || "",

    budget: d.budget || "",

    story: d.story || "",

    deadline: d.deadline || "",

    status: d.status || OrderStatus.NEW,

    paymentStatus: d.paymentStatus || window.PaymentStatus?.UNPAID || "UNPAID",

    creative,

    stages,

  };

  if (form.querySelector('[name="files_demoUrl"]')) {

    payload.files = {

      demoUrl: d.files_demoUrl || "",

      finalUrl: d.files_finalUrl || "",

      additionalFiles: (d.files_additional || "")

        .split("\n")

        .map((s) => s.trim())

        .filter(Boolean),

    };

  }

  return payload;

};



window.createOrderFromForm = function (raw) {

  const now = new Date().toISOString();

  const createdAction = window.OrderActivityTypes?.CREATED || "Создан заказ";

  const activityEntry = window.createActivityEntry

    ? createActivityEntry(createdAction)

    : { id: crypto.randomUUID?.() || `act-${Date.now()}`, date: now, action: createdAction, details: "" };



  return enrichOrder({

    id: crypto.randomUUID?.() || `order-${Date.now()}`,

    orderNumber: window.generateOrderNumber(),

    name: raw.name || "",

    contact: raw.contact || "",

    category: raw.category || "",

    budget: raw.budget || "",

    story: raw.story || "",

    deadline: raw.deadline || "",

    status: window.OrderStatus.NEW,

    paymentStatus: window.PaymentStatus?.UNPAID || "UNPAID",

    createdAt: now,

    updatedAt: now,

    activityLog: [activityEntry],

  });

};

