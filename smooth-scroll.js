document.addEventListener('DOMContentLoaded', () => {
    // Get all links in the navigation
    const links = document.querySelectorAll('.site-nav a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            
            // Get the target element
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                history.pushState(null, '', targetId);
            }
        });
    });
});
