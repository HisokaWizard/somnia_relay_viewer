import { modules } from '@/shared/generalModules';
import { useParams } from 'react-router';

export const ModuleDetails = () => {
  const { id } = useParams();
  const module = modules.find((m) => m.id === parseInt(id));
  return (
    <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center'>
      <div className='p-6 bg-gray-800 rounded-lg'>
        <h1 className='text-3xl'>{module.name}</h1>
        <p className='mt-4'>{module.description}</p>
        <a href='/' className='mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded'>
          Return to scene
        </a>
      </div>
    </div>
  );
};
