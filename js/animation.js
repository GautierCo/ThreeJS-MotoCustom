
const animation = {

    staggersColors: () => {
        gsap.from(".tray__swatch", {
            duration: 2,
            scale: 0.7, 
            opacity: 0, 
            delay: 0.1, 
            stagger: 0.2,
            ease: "elastic", 
            force3D: true
          });
        
        allBtnColors = document.querySelectorAll('.tray__swatch');
        
        allBtnColors.forEach(color => {
            
            color.addEventListener('click', (e) => {

                gsap.to(e.target, {
                    
                    duration: 0.5, 
                    stagger: 0.2,
                    ease: "back.in",                    
                });
                
            });
        });
    },
};
