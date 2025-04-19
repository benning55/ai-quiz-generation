import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  // Check if on home page
  const isHomePage = pathname === '/'

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Animation variants
  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300 }
    }
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    exit: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  }

  // Nav links data for easy management
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/quiz", label: "Practice Tests" },
    { href: "/study-guide", label: "Study Guide" },
    { href: "/about", label: "About" }
  ]

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? "bg-white/95 text-gray-800 shadow-lg backdrop-blur-md py-2" 
          : "bg-transparent text-white py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                }}
                className="relative w-10 h-10"
              >
                <Image
                  src="/images/maple-leaf.svg"
                  alt="Canadian Flag"
                  height={40}
                  width={40}
                  className={`${scrolled || !isHomePage ? "brightness-75 saturate-150" : "brightness-100"}`}
                />
              </motion.div>
              <div className="text-xl font-bold flex items-baseline">
                <span className={`font-extrabold ${scrolled || !isHomePage ? "text-red-600" : "text-white"}`}>
                  Can
                </span>
                <span className={`font-semibold ${scrolled || !isHomePage ? "text-gray-700" : "text-gray-100"}`}>
                  Citizen
                </span>
                <span className={`font-bold ${scrolled || !isHomePage ? "text-red-600" : "text-yellow-300"}`}>
                  Test
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <motion.div 
              initial="hidden"
              animate="visible"
              className="flex items-center gap-1"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={navItemVariants}>
                  <Link 
                    href={link.href}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      pathname === link.href 
                        ? scrolled || !isHomePage
                          ? "text-red-600" 
                          : "text-yellow-300" 
                        : scrolled || !isHomePage
                          ? "text-gray-700 hover:text-red-600" 
                          : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.href === pathname && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className={`absolute inset-0 rounded-full -z-10 ${
                          scrolled || !isHomePage ? "bg-red-50" : "bg-white/10"
                        }`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <SignedIn>
                <motion.div variants={navItemVariants}>
                  <Link 
                    href="/admin" 
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      pathname === "/admin" 
                        ? scrolled || !isHomePage
                          ? "text-red-600" 
                          : "text-yellow-300" 
                        : scrolled || !isHomePage
                          ? "text-gray-700 hover:text-red-600" 
                          : "text-white/90 hover:text-white"
                    }`}
                  >
                    {pathname === "/admin" && (
                      <motion.span
                        layoutId="navbar-indicator"
                        className={`absolute inset-0 rounded-full -z-10 ${
                          scrolled || !isHomePage ? "bg-red-50" : "bg-white/10"
                        }`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    Admin
                  </Link>
                </motion.div>
              </SignedIn>
            </motion.div>
            
            <motion.div 
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              className="ml-3 h-6 border-l border-gray-400/30"
            />
            
            <SignedIn>
              <motion.div 
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="ml-3"
              >
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9"
                    }
                  }}
                />
              </motion.div>
            </SignedIn>
            
            <SignedOut>
              <motion.div 
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                className="ml-3"
              >
                <Link 
                  href="/sign-in" 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    scrolled || !isHomePage
                      ? "text-gray-700 hover:text-red-600" 
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Sign In
                </Link>
              </motion.div>
              
              <motion.div 
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-2"
              >
                <Link 
                  href="/sign-up" 
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    scrolled || !isHomePage
                      ? "bg-red-600 text-white hover:bg-red-700" 
                      : "bg-white text-red-600 hover:bg-yellow-50"
                  }`}
                >
                  Sign Up
                </Link>
              </motion.div>
            </SignedOut>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden rounded-full p-2 z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            <motion.div
              animate={isMenuOpen ? "open" : "closed"}
              className={`w-6 h-6 flex flex-col justify-center items-center ${
                (scrolled || !isHomePage) && !isMenuOpen ? "text-gray-800" : "text-white"
              }`}
            >
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: 45, y: 2 }
                }}
                className={`block h-0.5 w-5 mb-1 ${
                  isMenuOpen || (!scrolled && isHomePage) ? "bg-white" : "bg-gray-800"
                }`}
              />
              <motion.span
                variants={{
                  closed: { opacity: 1 },
                  open: { opacity: 0 }
                }}
                className={`block h-0.5 w-5 mb-1 ${
                  isMenuOpen || (!scrolled && isHomePage) ? "bg-white" : "bg-gray-800"
                }`}
              />
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: -45, y: -2 }
                }}
                className={`block h-0.5 w-5 ${
                  isMenuOpen || (!scrolled && isHomePage) ? "bg-white" : "bg-gray-800"
                }`}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Animated */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="fixed inset-0 top-0 z-40 bg-gradient-to-br from-red-600 to-red-800 md:hidden"
          >
            <div className="container mx-auto px-4 pt-20 pb-6 flex flex-col h-full">
              <motion.nav 
                className="flex flex-col gap-3 mt-4"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.07,
                      delayChildren: 0.1
                    }
                  }
                }}
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href={link.href}
                      className={`block p-3 text-lg font-medium rounded-lg ${
                        pathname === link.href 
                          ? "bg-white/20 text-white" 
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <SignedIn>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/admin" 
                      className={`block p-3 text-lg font-medium rounded-lg ${
                        pathname === "/admin" 
                          ? "bg-white/20 text-white" 
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      Admin
                    </Link>
                  </motion.div>
                </SignedIn>
                
                <motion.div 
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0.6 }
                  }}
                  className="my-2 border-t border-white/20"
                />
                
                <SignedIn>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="p-3 flex items-center"
                  >
                    <span className="text-white mr-2">Your account:</span>
                    <UserButton afterSignOutUrl="/" />
                  </motion.div>
                </SignedIn>
                
                <SignedOut>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/sign-in" 
                      className="block p-3 text-lg font-medium text-white/80 hover:bg-white/10 rounded-lg"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-3"
                  >
                    <Link 
                      href="/sign-up" 
                      className="block p-3 text-lg font-medium bg-white text-red-600 hover:bg-yellow-50 rounded-lg text-center"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </SignedOut>
              </motion.nav>
              
              <div className="mt-auto">
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0.7, transition: { delay: 0.3 } }
                  }}
                  className="text-sm text-white/70 text-center pt-4"
                >
                  © {new Date().getFullYear()} CanCitizenTest
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
};
