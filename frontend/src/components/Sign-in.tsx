"use client";

import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import Link from "next/link";

// Firefly animation (random float + flicker)
const float = keyframes`
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
  25% { transform: translateY(-20px) translateX(10px) scale(1.2); opacity: 1; }
  50% { transform: translateY(20px) translateX(-10px) scale(0.9); opacity: 0.6; }
  75% { transform: translateY(-15px) translateX(5px) scale(1.1); opacity: 0.9; }
  100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
`;

export default function Login() {
  return (
    <Flex
      minH="100vh"
      position="relative"
      bgImage={`url('/profile.jpg')`} 
      bgSize="cover"
      bgPos="center"
      justify="center"
      align="center"
      overflow="hidden"
    >
      {/* Dark overlay */}
      <Box
        pos="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bgGradient="linear(to-b, blackAlpha.700, blackAlpha.900)"
        zIndex={0}
      />

      {/* Fireflies */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Box
          key={i}
          pos="absolute"
          w="8px"
          h="8px"
          bg="green.300"
          borderRadius="full"
          filter="blur(2px)"
          opacity={0.8}
          top={`${Math.random() * 100}%`}
          left={`${Math.random() * 100}%`}
          animation={`${float} ${4 + Math.random() * 6}s ease-in-out infinite`}
          animationDelay={`${Math.random() * 5}s`}
          zIndex={1}
          boxShadow="0 0 10px 2px rgba(34,197,94,0.9)"
        />
      ))}

      {/* Glowing login card */}
      <Box
        position="relative"
        zIndex={2}
        w="380px"
        p={10}
        borderRadius="2xl"
        bg="rgba(0,0,0,0.65)"
        backdropFilter="blur(14px)"
        textAlign="center"
        color="white"
        boxShadow="0px 0px 40px rgba(34,197,94,0.6), inset 0px 0px 20px rgba(56,189,248,0.3)"
        animation="float 6s ease-in-out infinite"
        _before={{
          content: '""',
          pos: "absolute",
          inset: 0,
          borderRadius: "2xl",
          p: "2px",
          bgGradient: "linear(to-r, teal.400, green.400, emerald.500)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        {/* Title */}
        <Heading
          size="2xl"
          mb={2}
          bgGradient="linear(to-r, green.200, teal.300, emerald.400)"
          bgClip="text"
          textShadow="0px 0px 30px rgba(16, 185, 129, 1)"
        >
          Mangrove
        </Heading>
        <Heading size="md" color="teal.100" mb={6}>
          🌿 Enter the Jungle Portal 🌿
        </Heading>

        <VStack gap={5}>
          <Input
            placeholder="Enter Username"
            variant="flushed"
            color="white"
            borderColor="green.300"
            _placeholder={{ color: "gray.400" }}
          />
          <Input
            type="password"
            placeholder="Enter Password"
            variant="flushed"
            color="white"
            borderColor="teal.300"
            _placeholder={{ color: "gray.400" }}
          />

          <Text fontSize="sm" color="green.200">
            <Link href="#">Forgot Password ?</Link>
          </Text>

          {/* Magic glowing button */}
          <Link href="/home">
            <Button
              w="100%"
              h="50px"
              fontSize="lg"
              bgGradient="linear(to-r, emerald.400, teal.500)"
              borderRadius="full"
              boxShadow="0 0 25px rgba(16, 185, 129, 0.9), 0 0 50px rgba(20, 184, 166, 0.7)"
              _hover={{
                bgGradient: "linear(to-r, teal.500, green.400)",
                transform: "scale(1.07)",
                boxShadow:
                  "0 0 35px rgba(34,197,94,1), 0 0 70px rgba(20,184,166,0.9)",
              }}
              transition="all 0.3s"
            >
              🌊 Enter Mangrove
            </Button>
          </Link>

          <Text>
            Not a Member?{" "}
            <Text
              as="span"
              color="green.300"
              fontWeight="bold"
              cursor="pointer"
              _hover={{
                textDecoration: "underline",
                color: "teal.200",
              }}
            >
              Sign Up!
            </Text>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
