import { useState, useEffect, useRef } from 'react';

function App() {
  const targetDate = new Date('2024-12-19T09:00:00'); // Set target date and time
  const [timeLeft, setTimeLeft] = useState(targetDate.getTime() - new Date().getTime());
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = 'black';
    document.body.style.color = 'white';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.documentElement.style.backgroundColor = 'black';    

    const intervalId = setInterval(() => {
      const currentTime = new Date();
      const newTimeLeft = targetDate.getTime() - currentTime.getTime();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [targetDate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Guard clause for null ctx

    const particles: any[] = [];
    particlesRef.current = particles;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Initialize particles only once
    const totalParticles = 1440 * 7; // Maximum particles for up to 7 days (arbitrary large buffer)
    for (let i = 0; i < totalParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 2, // Smaller square size (between 4 and 8)
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`, // Solid color
        visible: true, // Visibility flag
      });
    }

    function drawParticles() {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle) => {
          if (particle.visible) {
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size); // Square particles
          }
        });
      }
    }

    function updateParticles() {
      particles.forEach((particle) => {
        if (particle.visible) {
          particle.x += particle.dx;
          particle.y += particle.dy;

          // Bounce particles off the edges
          if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;
        }
      });
    }

    function animate() {
      drawParticles();
      updateParticles();
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  // Adjust particle visibility based on days, hours, and minutes left
  useEffect(() => {
    const daysLeft = Math.max(Math.floor(timeLeft / (1000 * 60 * 60 * 24)), 0);
    const hoursLeft = Math.max(Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 0);
    const minutesLeft = Math.max(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)), 0);

    const totalVisibleParticles = (daysLeft * 24 * 60) + (hoursLeft * 60) + minutesLeft;

    // Make particles visible only up to the remaining total (days * 24 * 60 + hours * 60 + minutes)
    particlesRef.current.forEach((particle, index) => {
      particle.visible = index < totalVisibleParticles;
    });
  }, [timeLeft]);

  // Convert time left into days, hours, minutes, and seconds
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div style={{ position: 'relative', height: '100vh', backgroundColor: 'black', color: 'white', overflow: 'hidden' }}>
      {/* Particle Background */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Timer Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: '12vw', // Use viewport width for responsive font size
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',          
        }}
      >
        <p>
          {hours}h {minutes}m {seconds}s
        </p>
      </div>

      {/* Responsive adjustment for smaller screens */}
      <style>
        {`
          @media (max-width: 600px) {
            div > p {
              font-size: 25vw; /* Increase font size on smaller screens */
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;
