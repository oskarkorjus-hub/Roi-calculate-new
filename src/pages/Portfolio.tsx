import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '../lib/portfolio-context';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailsModal } from '../components/ProjectDetailsModal';
import type { PortfolioProject } from '../types/portfolio';

// Custom easing for premium animations
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
};

export function Portfolio() {
  const { projects, deleteProject } = usePortfolio();
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteProject = useCallback((projectId: string) => {
    deleteProject(projectId);
    setShowDeleteConfirm(null);
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  }, [deleteProject, selectedProject]);

  // Empty State
  if (projects.length === 0) {
    return (
      <div className="text-white">
        {/* Atmospheric effects */}
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" />
        </div>

        <div className="relative z-10 max-w-[100%] mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Investment Portfolio</h1>
              <p className="text-zinc-400 text-sm mt-1 font-body">
                Track, analyze, and compare your investment projects
              </p>
            </div>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center p-10 card-premium rounded-2xl max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/80 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-zinc-500">folder_open</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">No Projects Yet</h3>
              <p className="text-zinc-400 font-body mb-6">
                Start by using any calculator to create your first investment project. Your portfolio analytics will appear here.
              </p>
              <div className="stat-card text-left">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400">lightbulb</span>
                  <p className="text-sm text-zinc-400 font-body">
                    <span className="text-zinc-300 font-medium">Tip:</span> Save projects from the calculator results to build your portfolio!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.header variants={itemVariants}>
          <h1 className="text-2xl font-semibold text-white">Saved Calculations</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
        </motion.header>

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
            >
              <ProjectCard
                project={project}
                onView={setSelectedProject}
                onDelete={() => setShowDeleteConfirm(project.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Project Details Modal */}
        <AnimatePresence>
          {selectedProject && (
            <ProjectDetailsModal
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
              onDelete={(id) => setShowDeleteConfirm(id)}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: premiumEase }}
                className="card-premium rounded-2xl p-6 max-w-sm w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">Delete Project?</h3>
                    <p className="text-sm text-zinc-400 font-body">This action cannot be undone</p>
                  </div>
                </div>
                <p className="text-zinc-400 mb-6 font-body">
                  The project and all its data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 btn-ghost py-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProject(showDeleteConfirm)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-display font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
