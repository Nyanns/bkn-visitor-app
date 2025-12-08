// File: frontend/src/components/AntigravityBackground.jsx
import { useEffect } from 'react';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import { motion, useSpring } from 'framer-motion';

// --- Antigravity Physics Components ---

const GOOGLE_COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58']; // Blue, Red, Yellow, Green
const SHAPES = ['circle', 'square', 'pill', 'triangle'];

const PhysicsShape = ({ mouseX, mouseY, index }) => {
    // Random initial properties
    const size = Math.random() * 60 + 40; // 40px to 100px
    const color = GOOGLE_COLORS[index % GOOGLE_COLORS.length];
    const shape = SHAPES[index % SHAPES.length];
    const initialTop = Math.random() * 90;
    const initialLeft = Math.random() * 90;

    // Physics Repulsion Logic
    // Using simple distance check: if mouse is close, push away
    const x = useSpring(0, { stiffness: 100, damping: 20 });
    const y = useSpring(0, { stiffness: 100, damping: 20 });
    const rotate = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        const unsubscribeX = mouseX.on("change", latestX => {
            const rectX = (window.innerWidth * initialLeft) / 100;
            const diffX = latestX - rectX;
            // Repulse if within 300px
            if (Math.abs(diffX) < 300) {
                const force = (300 - Math.abs(diffX)) * (diffX > 0 ? -0.5 : 0.5);
                x.set(force);
                rotate.set(force * 0.5);
            } else {
                x.set(0);
                rotate.set(0);
            }
        });

        const unsubscribeY = mouseY.on("change", latestY => {
            const rectY = (window.innerHeight * initialTop) / 100;
            const diffY = latestY - rectY;

            if (Math.abs(diffY) < 300) {
                const force = (300 - Math.abs(diffY)) * (diffY > 0 ? -0.5 : 0.5);
                y.set(force);
            } else {
                y.set(0);
            }
        });

        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [mouseX, mouseY, initialLeft, initialTop, x, y, rotate]);

    // Shape Styles
    const borderRadius =
        shape === 'circle' ? '50%' :
            shape === 'pill' ? '50px' :
                shape === 'square' ? '16px' : '16px';

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: `${initialTop}%`,
                left: `${initialLeft}%`,
                width: shape === 'pill' ? size * 1.5 : size,
                height: size,
                backgroundColor: color,
                borderRadius: borderRadius,
                x,
                y,
                rotate,
                opacity: 0.8,
                zIndex: 0,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
            animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
            }}
            transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );
};

// Reusable Background Component
const AntigravityBackground = ({ mouseX, mouseY, showText = true }) => {
    return (
        <Box
            position="absolute"
            top={0} left={0} right={0} bottom={0}
            zIndex={0}
            overflow="hidden"
            bg="#f8f9fa"
        >
            {/* Floating Props */}
            {[...Array(12)].map((_, i) => (
                <PhysicsShape key={i} index={i} mouseX={mouseX} mouseY={mouseY} />
            ))}

            {/* Big Text Overlay - Optional */}
            {showText && (
                <VStack
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={1}
                    spacing={0}
                    pointerEvents="none"
                >
                    <Heading fontSize={{ base: "6xl", md: "8xl" }} fontWeight="900" color="#202124" letterSpacing="-2px" lineHeight="0.9">
                        INTI
                    </Heading>
                    <Heading fontSize={{ base: "6xl", md: "8xl" }} fontWeight="900" color="#1a73e8" letterSpacing="-2px" lineHeight="0.9">
                        KAMI
                    </Heading>
                    <Text fontSize={{ base: "lg", md: "2xl" }} mt={4} color="#5f6368" fontWeight="500">
                        Data Center Visitor System
                    </Text>
                </VStack>
            )}
        </Box>
    );
};

export default AntigravityBackground;
