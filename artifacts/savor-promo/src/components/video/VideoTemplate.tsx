import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  open: 4000,
  menu: 6000,
  kitchen: 6000,
  admin: 6000,
  close: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  open: Scene1,
  menu: Scene2,
  kitchen: Scene3,
  admin: Scene4,
  close: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const blobPositions = [
    { x: '-10%', y: '-10%', scale: 1 },
    { x: '30%', y: '10%', scale: 1.2 },
    { x: '10%', y: '20%', scale: 0.9 },
    { x: '40%', y: '-5%', scale: 1.1 },
    { x: '0%', y: '5%', scale: 1 },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      {/* Persistent background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute rounded-full opacity-20 blur-[80px]"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent)', width: '60vw', height: '60vw' }}
          animate={blobPositions[sceneIndex]}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute rounded-full opacity-10 blur-[60px] right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, var(--color-accent), transparent)', width: '50vw', height: '50vw' }}
          animate={{
            x: ['10%', '-20%', '0%'],
            y: ['10%', '-30%', '10%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence initial={false} mode="wait">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
