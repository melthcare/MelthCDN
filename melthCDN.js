class MelthBooking extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" }); // Encapsulate styles & structure
    }
  
    async connectedCallback() {
      const doctorId = this.getAttribute("doctor-id");
      this.shadowRoot.innerHTML = `<p>Loading available slots...</p>`;
      await this.loadSlots(doctorId);
    }
  
    async loadSlots(doctorId) {
      try {
        const res = await fetch(`https://melth.care/api/doctors/${doctorId}/availability`);
        const slots = await res.json();
        this.renderWidget(slots);
      } catch (error) {
        this.shadowRoot.innerHTML = `<p>Error loading slots.</p>`;
      }
    }
  
    renderWidget(slots) {
      if (!slots.length) {
        this.shadowRoot.innerHTML = `<p>No available slots.</p>`;
        return;
      }
  
      const slotButtons = slots.map(slot => `<button class="slot" data-slot="${slot}">${slot}</button>`).join("");
      
      this.shadowRoot.innerHTML = `
        <style>
          .slot { padding: 10px; margin: 5px; cursor: pointer; }
          #form { display: none; margin-top: 10px; }
        </style>
        <h3>Available Slots</h3>
        <div id="slots">${slotButtons}</div>
        <div id="form">
          <input type="text" id="name" placeholder="Your Name">
          <input type="email" id="email" placeholder="Your Email">
          <button id="submit">Book Now</button>
        </div>
        <p id="message"></p>
      `;
  
      this.shadowRoot.querySelectorAll(".slot").forEach(button => {
        button.addEventListener("click", (e) => {
          this.shadowRoot.getElementById("form").style.display = "block";
          this.setAttribute("selected-slot", e.target.dataset.slot);
        });
      });
  
      this.shadowRoot.getElementById("submit").addEventListener("click", () => this.bookSlot());
    }
  
    async bookSlot() {
      const name = this.shadowRoot.getElementById("name").value;
      const email = this.shadowRoot.getElementById("email").value;
      const selectedSlot = this.getAttribute("selected-slot");
      const doctorId = this.getAttribute("doctor-id");
  
      if (!name || !email || !selectedSlot) return;
  
      try {
        const res = await fetch(`https://melth.care/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorId, name, email, slot: selectedSlot })
        });
        const result = await res.json();
        this.shadowRoot.getElementById("message").textContent = result.message || "Booking successful!";
      } catch (error) {
        this.shadowRoot.getElementById("message").textContent = "Error booking slot. Please try again.";
      }
    }
  }
  
  // Register the component
  customElements.define("melth-booking", MelthBooking);
  