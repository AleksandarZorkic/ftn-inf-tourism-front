type ToastType = "success" | "error" | "info" | "warn";

class Notify {
  private container: HTMLElement;

  constructor() {
    this.container = document.getElementById("toast-container") as HTMLElement;
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.setAttribute("aria-live", "polite");
      document.body.prepend(this.container);
    }
  }

  show(message: string, type: ToastType = "info", duration = 2000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove(), {
        once: true,
      });
    }, duration);
  }

  success(msg: string, d = 2000) {
    this.show(msg, "success", d);
  }
  error(msg: string, d = 2000) {
    this.show(msg, "error", d);
  }
  info(msg: string, d = 2000) {
    this.show(msg, "info", d);
  }
  warn(msg: string, d = 2000) {
    this.show(msg, "warn", d);
  }
}

export const notify = new Notify();
