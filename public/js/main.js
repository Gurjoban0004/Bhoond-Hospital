// ── Sidebar ───────────────────────────────────────────────────────────────────
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.toggle('active');
}

// ── Hamburger menu ────────────────────────────────────────────────────────────
function toggleHamburgerMenu() {
    const panel = document.getElementById('hamburgerContent');
    const btn   = document.getElementById('threeLinesBtn');
    if (!panel || !btn) return;

    const isActive = panel.classList.toggle('active');
    panel.setAttribute('aria-hidden', String(!isActive));
    btn.setAttribute('aria-expanded', String(isActive));
}

// Close hamburger when clicking outside
document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('click', function (e) {
        const panel = document.getElementById('hamburgerContent');
        const btn   = document.getElementById('threeLinesBtn');
        if (panel && btn && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
        }
    });

    // Highlight active bottom nav item
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        if (link.href === window.location.href) link.classList.add('active');
    });

    // Contact form (contact.html)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData   = new FormData(contactForm);
            const contactData = Object.fromEntries(formData);
            const messageDiv = document.getElementById('formMessage');

            try {
                const response = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactData),
                });
                const result = await response.json();

                if (response.ok) {
                    messageDiv.textContent = result.message || 'Message sent successfully!';
                    messageDiv.style.color = 'green';
                    contactForm.reset();
                } else {
                    messageDiv.textContent = result.error || 'Failed to send message.';
                    messageDiv.style.color = 'red';
                }
            } catch {
                messageDiv.textContent = 'Error sending message. Please try again.';
                messageDiv.style.color = 'red';
            }
        });
    }
});

console.log('Bhoond Aesthetic Clinic — loaded');
