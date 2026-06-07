window.DataPortabilityService = {
  get provider() {
    return window.MalsuProvider || window.LocalProvider;
  },

  exportJson() {
    const data = this.provider.exportAll();
    return JSON.stringify(data, null, 2);
  },

  importJson(jsonString) {
    const payload = JSON.parse(jsonString);
    const required = ["orders", "albums", "tracks", "reviews", "faq", "pricing", "settings"];
    required.forEach((key) => {
      if (payload[key] === undefined) throw new Error(`Отсутствует раздел: ${key}`);
    });
    return this.provider.importAll(payload);
  },

  downloadExport() {
    const blob = new Blob([this.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `malsu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
