/**
 * Smooth scroll to a section by ID
 * @param sectionId - The ID of the section to scroll to (without #)
 * @param offset - Optional offset from top (default: 80px for navbar)
 */
export const smoothScrollToSection = (sectionId: string, offset: number = 80) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
};

/**
 * Handle hash navigation on page load
 */
export const handleHashNavigation = () => {
  const hash = window.location.hash;
  if (hash) {
    const sectionId = hash.replace('#', '');
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      smoothScrollToSection(sectionId);
    }, 100);
  }
};
