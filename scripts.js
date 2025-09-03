// Bloom'n Events Co - Consolidated Scripts
// Performance optimized with lazy loading and efficient event handling

// Performance optimization: Use requestIdleCallback for non-critical tasks
const runWhenIdle = (callback) => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        setTimeout(callback, 1);
    }
};

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Single DOMContentLoaded event listener for all functionality
document.addEventListener('DOMContentLoaded', function() {
    // ===== NAVBAR FUNCTIONALITY =====
    const navbar = document.getElementById('homeNavbar');
    if (navbar) {
        const body = document.body;
        const portfolioDropdown = navbar.querySelector('.dropdown');
        let lastScrollTop = 0;
        
        // Initialize navbar to start at bottom
        const initializeNavbar = () => {
            // Always start at bottom - force the classes
            navbar.classList.remove('fixed-top');
            navbar.classList.add('fixed-bottom');
            body.classList.remove('navbar-top');
            if (portfolioDropdown) {
                portfolioDropdown.classList.remove('dropdown');
                portfolioDropdown.classList.add('dropup');
            }
            console.log('Navbar initialized at bottom, classes:', navbar.className);
        };
        
        // Initialize navbar position
        initializeNavbar();
        
        // Dynamic navbar behaviour for home page with dropdown direction switching
        // Throttled for better performance
        const handleScroll = throttle(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            console.log('Scroll event fired, scrollTop:', scrollTop);
            
            // Check if we're near the top of the page
            if (scrollTop <= 100) {
                // At the top - switch to fixed-bottom (dropup behaviour)
                if (!navbar.classList.contains('fixed-bottom')) {
                    navbar.classList.remove('fixed-top');
                    navbar.classList.add('fixed-bottom');
                    body.classList.remove('navbar-top');
                    
                    // Switch to dropup (menu opens upward) when navbar is at bottom
                    if (portfolioDropdown) {
                        portfolioDropdown.classList.remove('dropdown');
                        portfolioDropdown.classList.add('dropup');
                    }
                    console.log('Switched to bottom, scroll:', scrollTop, 'classes:', navbar.className);
                }
            } else {
                // Away from top - switch to fixed-top (dropdown behaviour)
                if (!navbar.classList.contains('fixed-top')) {
                    navbar.classList.remove('fixed-bottom');
                    navbar.classList.add('fixed-top');
                    body.classList.add('navbar-top');
                    
                    // Switch to dropdown (menu opens downward) when navbar is at top
                    if (portfolioDropdown) {
                        portfolioDropdown.classList.remove('dropup');
                        portfolioDropdown.classList.add('dropdown');
                    }
                    console.log('Switched to top, scroll:', scrollTop, 'classes:', navbar.className);
                }
            }
            
            lastScrollTop = scrollTop;
        }, 16); // ~60fps
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Test scroll event
        console.log('Scroll event listener added');
        
        // Mobile menu click prevention
        const mobileMenu = navbar.querySelector('.navbar-collapse');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // ===== FORM VALIDATION =====
    // Note: Enhanced form validation is handled later in the script
    
    // ===== ENHANCED IMAGE LAZY LOADING =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add loading state
                    img.classList.add('loading');
                    
                    // Create a new image to preload
                    const newImg = new Image();
                    newImg.onload = () => {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy', 'loading');
                        img.classList.add('loaded');
                        
                        // Track image load for analytics
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'image_load', {
                                event_category: 'Performance',
                                event_label: img.alt || 'Unknown',
                                value: 1
                            });
                        }
                    };
                    newImg.onerror = () => {
                        img.classList.remove('lazy', 'loading');
                        img.classList.add('error');
                        console.warn('Failed to load image:', img.dataset.src);
                    };
                    newImg.src = img.dataset.src;
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Start loading 50px before image comes into view
            threshold: 0.01
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // ===== ENHANCED ACCESSIBILITY FEATURES =====
    // Add skip link functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only sr-only-focusable';
    skipLink.style.cssText = 'position: absolute; top: -40px; left: 6px; z-index: 1000; background: var(--coreCharcoal); color: var(--coreGold); padding: 8px; text-decoration: none; border-radius: 4px; transition: top 0.3s ease;';
    
    // Enhanced skip link behavior
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Enhanced focus management for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--coreGold)';
            this.style.outlineOffset = '2px';
            
            // Announce focus changes to screen readers
            if (this.getAttribute('aria-label') || this.textContent.trim()) {
                const announcement = this.getAttribute('aria-label') || this.textContent.trim();
                announceToScreenReader(announcement);
            }
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Screen reader announcement function
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Enhanced keyboard navigation for carousels
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const direction = e.key === 'ArrowLeft' ? 'prev' : 'next';
                const control = carousel.querySelector(`.carousel-control-${direction}`);
                if (control) {
                    control.click();
                }
            }
        });
    });
    
    // ===== AUTO-FULLSCREEN IMAGE FUNCTIONALITY =====
    // Get all images in main content, excluding carousels and client logos
    const images = document.querySelectorAll('main img:not(.carousel-item img):not(.client-logo-img):not(.navbar-logo):not(.footer-logo)');
    
    images.forEach((img, index) => {
        // Create unique ID for each image
        const modalId = `fullscreen-${Date.now()}-${index}`;
        
        // Wrap image in clickable link
        const wrapper = document.createElement('a');
        wrapper.href = `#${modalId}`;
        wrapper.style.display = 'block';
        wrapper.style.textDecoration = 'none';
        
        // Insert wrapper before image and move image into it
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Create fullscreen modal
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <a href="#" class="close-btn">&times;</a>
                <img src="${img.src}" alt="${img.alt} - Fullscreen">
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Add click event to close modal
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = '';
        });
        
        // Close modal when clicking outside the image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.location.hash = '';
            }
        });
        
        // Close modal with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && window.location.hash === `#${modalId}`) {
                window.location.hash = '';
            }
        });
    });
    
    // ===== CHATBOT FUNCTIONALITY =====
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotTyping = document.getElementById('chatbot-typing');
    const chatbotNotification = document.getElementById('chatbot-notification');
    
    if (chatbotWidget) {
        let isOpen = false;
        let hasInteracted = false;
        
        // Show notification after 3 seconds if user hasn't interacted
        // Use requestIdleCallback for better performance
        runWhenIdle(() => {
            setTimeout(() => {
                if (!hasInteracted) {
                    chatbotNotification.style.display = 'flex';
                    
                    // Track chatbot notification display
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'chatbot_notification_shown', {
                            event_category: 'Engagement',
                            event_label: 'Auto Notification',
                            value: 1
                        });
                    }
                }
            }, 3000);
        });
        
        // Toggle chatbot with analytics tracking
        chatbotToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                chatbotContainer.classList.add('show');
                chatbotInput.focus();
                chatbotNotification.style.display = 'none';
                hasInteracted = true;
                
                // Track chatbot open
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'chatbot_opened', {
                        event_category: 'Engagement',
                        event_label: 'Chatbot Interaction',
                        value: 1
                    });
                }
            } else {
                chatbotContainer.classList.remove('show');
                
                // Track chatbot close
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'chatbot_closed', {
                        event_category: 'Engagement',
                        event_label: 'Chatbot Interaction',
                        value: 1
                    });
                }
            }
        });
        
        // Close chatbot
        chatbotClose.addEventListener('click', () => {
            isOpen = false;
            chatbotContainer.classList.remove('show');
        });
        
        // Send message
        function sendMessage() {
            const message = chatbotInput.value.trim();
            if (!message) return;
            
            // Add user message
            addMessage(message, 'user');
            chatbotInput.value = '';
            
            // Show typing indicator
            showTyping();
            
            // Get bot response after delay
            setTimeout(() => {
                hideTyping();
                const response = getBotResponse(message);
                addMessage(response.text, 'bot', response.quickReplies);
            }, 1000 + Math.random() * 1000);
        }
        
        // Send button click
        chatbotSend.addEventListener('click', sendMessage);
        
        // Enter key press
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Quick reply buttons - use event delegation on the messages container
        chatbotMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('chatbot-quick-reply')) {
                e.preventDefault();
                e.stopPropagation();
                
                const message = e.target.dataset.message;
                console.log('Quick reply clicked:', message); // Debug log
                
                // Add user message immediately
                addMessage(message, 'user');
                
                // Show typing indicator
                showTyping();
                
                // Get bot response after delay
                setTimeout(() => {
                    hideTyping();
                    const response = getBotResponse(message);
                    addMessage(response.text, 'bot', response.quickReplies);
                }, 1000 + Math.random() * 1000);
            }
        });
        
        // Add message to chat
        function addMessage(text, sender, quickReplies = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message chatbot-message-${sender}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'chatbot-avatar';
            avatar.innerHTML = sender === 'bot' ? '<i class="bi bi-flower1"></i>' : '<i class="bi bi-person"></i>';
            
            const content = document.createElement('div');
            content.className = 'chatbot-message-content';
            
            const textP = document.createElement('p');
            textP.textContent = text;
            content.appendChild(textP);
            
            if (quickReplies && sender === 'bot') {
                const quickRepliesDiv = document.createElement('div');
                quickRepliesDiv.className = 'chatbot-quick-replies';
                
                quickReplies.forEach(reply => {
                    const button = document.createElement('button');
                    button.className = 'chatbot-quick-reply';
                    button.type = 'button';
                    button.textContent = reply.text;
                    button.dataset.message = reply.message;
                    button.style.cursor = 'pointer';
                    
                    // Add click event directly to each button as backup
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Direct button click:', reply.message);
                        
                        // Add user message immediately
                        addMessage(reply.message, 'user');
                        
                        // Show typing indicator
                        showTyping();
                        
                        // Get bot response after delay
                        setTimeout(() => {
                            hideTyping();
                            const response = getBotResponse(reply.message);
                            addMessage(response.text, 'bot', response.quickReplies);
                        }, 1000 + Math.random() * 1000);
                    });
                    
                    quickRepliesDiv.appendChild(button);
                });
                
                content.appendChild(quickRepliesDiv);
            }
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
            chatbotMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Show typing indicator
        function showTyping() {
            chatbotTyping.style.display = 'flex';
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Hide typing indicator
        function hideTyping() {
            chatbotTyping.style.display = 'none';
        }
        
        // Get bot response based on user input
        function getBotResponse(userMessage) {
            const message = userMessage.toLowerCase();
            
            // Corporate Events
            if (message.includes('corporate') || message.includes('business') || message.includes('company')) {
                return {
                    text: "We excel at corporate events! From team building workshops to networking events and company celebrations. We've worked with major clients like Hawaiian and Centuria. Our corporate services include event planning, custom displays, and team building activities.",
                    quickReplies: [
                        { text: "Team Building", message: "Tell me about your team building workshops" },
                        { text: "Networking Events", message: "What networking events do you organize?" },
                        { text: "Corporate Displays", message: "Show me your corporate display work" },
                        { text: "Get Quote", message: "I need a quote for a corporate event" }
                    ]
                };
            }
            
            // Food Festivals
            if (message.includes('food festival') || message.includes('hawaiian') || message.includes('culinary')) {
                return {
                    text: "Food festivals are our specialty! We've created amazing events like the Hawaiian World of Flavours and Neighbourhood Nibbles. We handle everything from concept to execution, including displays, activities, and vendor coordination.",
                    quickReplies: [
                        { text: "Hawaiian Events", message: "Tell me about your Hawaiian food festival work" },
                        { text: "Event Planning", message: "How do you plan food festivals?" },
                        { text: "Vendor Coordination", message: "Do you coordinate with food vendors?" },
                        { text: "Gallery", message: "Show me your food festival photos" }
                    ]
                };
            }
            
            // Adult Workshops
            if (message.includes('adult workshop') || message.includes('adult class') || message.includes('grown up')) {
                return {
                    text: "Our adult workshops are perfect for team building, community events, or just fun! We offer craft activities, cooking classes, and creative projects. Great for corporate events, community groups, or special occasions.",
                    quickReplies: [
                        { text: "Craft Workshops", message: "What craft workshops do you offer for adults?" },
                        { text: "Cooking Classes", message: "Tell me about your adult cooking classes" },
                        { text: "Team Building", message: "Do you do corporate team building workshops?" },
                        { text: "Book Workshop", message: "How can I book an adult workshop?" }
                    ]
                };
            }
            
            // Kids Workshops
            if (message.includes('kids') || message.includes('children') || message.includes('child') || message.includes('school holiday')) {
                return {
                    text: "Kids love our workshops! We create engaging, age-appropriate activities that are both fun and educational. Perfect for school holiday programs, birthday parties, or community events. All activities are safe and supervised.",
                    quickReplies: [
                        { text: "School Holidays", message: "What school holiday workshops do you offer?" },
                        { text: "Birthday Parties", message: "Do you do kids birthday party workshops?" },
                        { text: "Age Groups", message: "What age groups do you cater for?" },
                        { text: "Safety", message: "How do you ensure child safety?" }
                    ]
                };
            }
            
            // Team Building
            if (message.includes('team building') || message.includes('teamwork') || message.includes('corporate training')) {
                return {
                    text: "Team building is one of our strengths! We create engaging workshops that bring teams together through creative activities, problem-solving challenges, and collaborative projects. Perfect for improving workplace relationships and communication.",
                    quickReplies: [
                        { text: "Workshop Types", message: "What types of team building workshops do you offer?" },
                        { text: "Group Sizes", message: "What group sizes can you accommodate?" },
                        { text: "Duration", message: "How long are your team building sessions?" },
                        { text: "Book Session", message: "How can I book a team building workshop?" }
                    ]
                };
            }
            
            // Seasonal Displays
            if (message.includes('seasonal') || message.includes('christmas') || message.includes('easter') || message.includes('holiday')) {
                return {
                    text: "We create stunning seasonal displays for any time of year! From Christmas decorations to Easter displays, we transform spaces with beautiful, themed installations that capture the spirit of the season.",
                    quickReplies: [
                        { text: "Christmas Displays", message: "What Christmas displays do you create?" },
                        { text: "Easter Displays", message: "Tell me about your Easter displays" },
                        { text: "Custom Themes", message: "Can you create custom seasonal themes?" },
                        { text: "Installation", message: "Do you install the displays?" }
                    ]
                };
            }
            
            // Custom Displays
            if (message.includes('custom display') || message.includes('branded') || message.includes('themed')) {
                return {
                    text: "Custom displays are our specialty! We work with your brand and vision to create unique, eye-catching displays that perfectly represent your business or event. From concept to installation, we handle everything.",
                    quickReplies: [
                        { text: "Design Process", message: "How do you design custom displays?" },
                        { text: "Brand Integration", message: "How do you incorporate my brand?" },
                        { text: "Timeline", message: "How long does it take to create a custom display?" },
                        { text: "Get Quote", message: "I want a quote for a custom display" }
                    ]
                };
            }
            
            // Pricing and Quotes
            if (message.includes('quote') || message.includes('pricing') || message.includes('cost') || message.includes('budget') || message.includes('price')) {
                return {
                    text: "We'd love to provide you with a detailed quote! Our pricing depends on the scope of your event, number of participants, materials needed, and location. We offer competitive rates and can work within various budgets.",
                    quickReplies: [
                        { text: "Get Quote", message: "I want a detailed quote for my event" },
                        { text: "Budget Options", message: "What are your budget-friendly options?" },
                        { text: "Package Deals", message: "Do you offer package deals?" },
                        { text: "Contact", message: "I want to discuss pricing" }
                    ]
                };
            }
            
            // Contact Information
            if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('reach')) {
                return {
                    text: "We'd love to hear from you! You can reach us through our contact page on the website, or I can help you get started right here. We're based in Brookton, WA, and serve the greater Perth area.",
                    quickReplies: [
                        { text: "Contact Page", message: "I want to visit your contact page" },
                        { text: "Location", message: "Where exactly are you located?" },
                        { text: "Service Areas", message: "What areas do you serve?" },
                        { text: "Get Started", message: "I want to get started with an event" }
                    ]
                };
            }
            
            // Location and Service Areas
            if (message.includes('location') || message.includes('where') || message.includes('based') || message.includes('brookton') || message.includes('perth')) {
                return {
                    text: "We're based in Brookton, WA, and proudly serve the greater Perth area and beyond! We're happy to travel for events and have experience working throughout Western Australia. Distance is no barrier to creating amazing events!",
                    quickReplies: [
                        { text: "Service Areas", message: "What specific areas do you serve?" },
                        { text: "Travel", message: "Do you travel for events?" },
                        { text: "Local Events", message: "Have you done events in my area?" },
                        { text: "Contact", message: "How can I contact you?" }
                    ]
                };
            }
            
            // Portfolio and Gallery
            if (message.includes('portfolio') || message.includes('gallery') || message.includes('examples') || message.includes('show') || message.includes('work')) {
                return {
                    text: "We're proud of our work! We've created amazing events for clients like Hawaiian, Centuria, and many local businesses. Check out our gallery to see our recent projects, or visit our Events, Workshops, and Displays pages for specific examples.",
                    quickReplies: [
                        { text: "View Gallery", message: "I want to see your gallery" },
                        { text: "Client Examples", message: "Show me your client work" },
                        { text: "Testimonials", message: "What do clients say about you?" },
                        { text: "Recent Work", message: "Show me your recent projects" }
                    ]
                };
            }
            
            // Testimonials
            if (message.includes('testimonial') || message.includes('review') || message.includes('feedback') || message.includes('client say')) {
                return {
                    text: "Our clients love working with us! We have testimonials from Hawaiian, Centuria, and many satisfied customers. They praise our creativity, professionalism, and ability to bring their visions to life. Check out our testimonials on the website!",
                    quickReplies: [
                        { text: "View Testimonials", message: "I want to see your testimonials" },
                        { text: "Client Stories", message: "Tell me about your client success stories" },
                        { text: "References", message: "Can you provide client references?" },
                        { text: "Book Meeting", message: "I want to book a consultation" }
                    ]
                };
            }
            
            // General Event Planning
            if (message.includes('event') || message.includes('planning') || message.includes('organize') || message.includes('celebration')) {
                return {
                    text: "We specialize in creating unforgettable events! Our services include corporate events, community celebrations, food festivals, and custom displays. We handle everything from concept to execution, ensuring your vision comes to life perfectly.",
                    quickReplies: [
                        { text: "Corporate Events", message: "Tell me about your corporate event services" },
                        { text: "Food Festivals", message: "What food festival events have you done?" },
                        { text: "Community Events", message: "Do you do community celebrations?" },
                        { text: "Get Quote", message: "I need a quote for my event" }
                    ]
                };
            }
            
            // Workshop General
            if (message.includes('workshop') || message.includes('class') || message.includes('learn') || message.includes('activity')) {
                return {
                    text: "We offer amazing workshops for both adults and children! Our workshops include craft activities, cooking classes, and creative projects. Perfect for team building, community events, or school holiday programs.",
                    quickReplies: [
                        { text: "Adult Workshops", message: "What adult workshops do you offer?" },
                        { text: "Kids Workshops", message: "Tell me about your children's workshops" },
                        { text: "Team Building", message: "Do you do corporate team building workshops?" },
                        { text: "Book Workshop", message: "How can I book a workshop?" }
                    ]
                };
            }
            
            // Display General
            if (message.includes('display') || message.includes('decoration') || message.includes('setup') || message.includes('installation')) {
                return {
                    text: "Our custom displays are perfect for any occasion! We create beautiful, themed displays that capture attention and create memorable experiences. From seasonal decorations to branded installations, we bring your ideas to life.",
                    quickReplies: [
                        { text: "Seasonal Displays", message: "What seasonal displays do you create?" },
                        { text: "Custom Displays", message: "Can you create custom displays for my business?" },
                        { text: "Gallery", message: "Show me examples of your displays" },
                        { text: "Quote", message: "How much do displays cost?" }
                    ]
                };
            }
            
            // Default response
            return {
                text: "I'm here to help with all your event planning needs! Whether you're looking for event planning, workshops, custom displays, or just want to learn more about our services, I'm happy to assist. What would you like to know?",
                quickReplies: [
                    { text: "Event Planning", message: "Tell me about your event planning services" },
                    { text: "Workshops", message: "What workshops do you offer?" },
                    { text: "Displays", message: "Show me your displays" },
                    { text: "Contact", message: "How can I contact you?" }
                ]
            };
        }
        
        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            if (isOpen && !chatbotWidget.contains(e.target)) {
                isOpen = false;
                chatbotContainer.classList.remove('show');
            }
        });
        
        // Prevent chatbot from closing when clicking inside
        chatbotContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Debug function - you can call this in browser console to test
        window.testChatbot = function(message) {
            console.log('Testing chatbot with message:', message);
            const response = getBotResponse(message);
            console.log('Bot response:', response);
            addMessage(response.text, 'bot', response.quickReplies);
        };
        
        // Add a test button for debugging (remove in production)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const testButton = document.createElement('button');
            testButton.textContent = 'Test Chatbot';
            testButton.style.position = 'fixed';
            testButton.style.top = '10px';
            testButton.style.right = '10px';
            testButton.style.zIndex = '10001';
            testButton.style.padding = '10px';
            testButton.style.background = 'red';
            testButton.style.color = 'white';
            testButton.style.border = 'none';
            testButton.style.borderRadius = '5px';
            testButton.onclick = () => {
                addMessage('Test message', 'user');
                setTimeout(() => {
                    const response = getBotResponse('Tell me about your event planning services');
                    addMessage(response.text, 'bot', response.quickReplies);
                }, 1000);
            };
            document.body.appendChild(testButton);
        }
    }
    
    // ===== ERROR HANDLING AND PERFORMANCE MONITORING =====
    
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        
        // Track errors in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.error?.message || 'Unknown error',
                fatal: false
            });
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
        
        // Track promise rejections in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.reason?.message || 'Unhandled promise rejection',
                fatal: false
            });
        }
    });
    
    // Performance monitoring
    if ('PerformanceObserver' in window) {
        // Monitor Core Web Vitals
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'lcp', {
                            event_category: 'Web Vitals',
                            value: Math.round(entry.startTime),
                            non_interaction: true,
                        });
                    }
                }
                
                if (entry.entryType === 'first-input') {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'fid', {
                            event_category: 'Web Vitals',
                            value: Math.round(entry.processingStart - entry.startTime),
                            non_interaction: true,
                        });
                    }
                }
                
                if (entry.entryType === 'layout-shift') {
                    if (!entry.hadRecentInput) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'cls', {
                                event_category: 'Web Vitals',
                                value: entry.value,
                                non_interaction: true,
                            });
                        }
                    }
                }
            }
        });
        
        observer.observe({type: 'largest-contentful-paint', buffered: true});
        observer.observe({type: 'first-input', buffered: true});
        observer.observe({type: 'layout-shift', buffered: true});
    }
    
    // Service Worker registration for offline functionality
    if ('serviceWorker' in navigator) {
        runWhenIdle(() => {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
        });
    }
    
    // Preload critical resources
    const preloadCriticalResources = () => {
        const criticalImages = [
            'images/logo-wht.png',
            'images/logo-blk-long.png'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    };
    
    // Run preloading when idle
    runWhenIdle(preloadCriticalResources);
    
    // Enhanced form validation with better UX
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('is-invalid')) {
                    validateField(input);
                }
            }, 300));
        });
        
        form.addEventListener('submit', (e) => {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // Focus first invalid field
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const type = field.type;
        
        let isValid = true;
        let errorMessage = '';
        
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (value) {
            switch (type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
            }
        }
        
        // Update field state
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            removeErrorMessage(field);
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            showErrorMessage(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showErrorMessage(field, message) {
        removeErrorMessage(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeErrorMessage(field) {
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }
});
