// Footer loader utility - handles both local file access and web server
async function loadFooter() {
  // Check if we're running on a web server or local file
  const isLocalFile = window.location.protocol === 'file:';

  if (isLocalFile) {
    // For local file access, use the fallback footer directly
    loadFallbackFooter();
  } else {
    // For web server, try to fetch the external footer file
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
      console.error('Error loading footer from server, using fallback:', error);
      loadFallbackFooter();
    }
  }
}

// Fallback footer content (embedded version of footer.html)
function loadFallbackFooter() {
  const footerHTML = `
    <footer class="bg-[#1a130f] text-white py-10">
      <div class="max-w-6xl mx-auto text-sm px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <!-- Quick Links -->
          <div class="md:pr-6">
            <h3 class="text-xl font-semibold mb-4 border-b border-[#2d211c] pb-2">
              Quick links
            </h3>
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-300">
              <a href="index.html" class="hover:text-white">Home</a>
              <a href="index.html#nearby-destinations" class="hover:text-white">Nearby Destinations</a>
              <a href="index.html#gateway-to-prehistory" class="hover:text-white">Gateway to Prehistory</a>
              <a href="index.html#accommodation" class="hover:text-white">Accommodation</a>
              <a href="index.html#key-fossils" class="hover:text-white">Key fossils</a>
              <a href="index.html#gallery" class="hover:text-white">Gallery</a>
              <a href="index.html#information-center" class="hover:text-white">Information Center</a>
              <a href="index.html#faqContainer" class="hover:text-white">FAQs</a>
            </div>
          </div>

          <!-- Visitor Information -->
          <div>
            <h3 class="text-xl font-semibold mb-4 border-b border-[#2d211c] pb-2">
              Visitor Information
            </h3>
            <p class="text-gray-300 mb-3">
              <span class="font-semibold">Entry Fees</span><br />
              Domestic - 3,000 MNT | International - 10,000 MNT
            </p>
            <p class="text-gray-300 mb-3">
              <span class="font-semibold">Best Time to Visit:</span>
              May - October
            </p>
            <p class="text-gray-300">
              <span class="font-semibold">Location</span><br />
              Bayanzag, Ömnögovi Province, Mongolia
            </p>
          </div>

          <!-- Contacts & Socials -->
          <div>
            <h3 class="text-xl font-semibold mb-4 border-b border-[#2d211c] pb-2">
              Contact & Follow Us
            </h3>
            <div class="text-gray-300 mb-4">
              <p class="mb-2">
                <span class="font-semibold">Phone:</span><br />
                +976 1234 5678
              </p>
              <p class="mb-2">
                <span class="font-semibold">Email:</span><br />
                info@flamingcliffs.mn
              </p>
            </div>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white text-xl">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white text-xl">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white text-xl">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="#" class="text-gray-400 hover:text-white text-xl">
                <i class="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-[#2d211c] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div class="text-gray-400 text-xs mb-4 md:mb-0">
            <p>© 2025 Flaming Cliffs Administration. All Rights Reserved.</p>
            <p>Gateway to Prehistory - UNESCO World Heritage Site</p>
          </div>
          <div class="flex space-x-6 text-xs text-gray-400">
            <a href="#" class="hover:text-white">Privacy Policy</a>
            <a href="#" class="hover:text-white">Terms of Service</a>
            <a href="#" class="hover:text-white">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = footerHTML;
  } else {
    // If no placeholder, append to body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
}

// Load footer when DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter);
