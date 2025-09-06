// Footer loader utility
async function loadFooter() {
  try {
    const response = await fetch('footer.html');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const footerHTML = await response.text();
    
    // Find footer placeholder and replace with actual footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = footerHTML;
    } else {
      // If no placeholder, append to body
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
  } catch (error) {
    console.error('Error loading footer:', error);
    // Fallback: create a simple footer if loading fails
    const fallbackFooter = `
      <footer class="bg-[#1a130f] text-white text-center py-6">
        <p>© 2025 Flaming Cliffs Administration | All Rights Reserved</p>
      </footer>
    `;
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = fallbackFooter;
    }
  }
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);
