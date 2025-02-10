import React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Drawer } from 'vaul'
import { useMediaQuery } from '@/hooks'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
}) => {
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Close modal when clicking escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-lg bg-white dark:bg-gray-800">
            <div className="flex-1 overflow-y-auto rounded-t-lg px-4">
              <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className={cn("relative pb-8", className)}>
                <button
                  onClick={onClose}
                  className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
                {children}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  'relative rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800',
                  className
                )}
              >
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
} 