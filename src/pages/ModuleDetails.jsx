import { modules } from '@/shared/generalModules';
import { useParams } from 'react-router';
import { RealtimeTransactions } from '@/widgets/RealtimeTransactions';
import { Canvas } from '@react-three/fiber';

const moduleRouterMap = {
  multistream: () => <div>Here will be multistream</div>,
  icedb: () => <div>Here will be ice db</div>,
  evm_optimisation: () => <div>Here will be evm optimisation</div>,
  partners: () => <div>Here will be partners</div>,
  transactions: RealtimeTransactions,
};

const generalContainerStyles = {
  margin: 0,
  padding: 0,
  width: '100%',
  height: '100vh',
  position: 'relative',
};

const commonStyles = {
  width: '100%',
  height: '50px',
  backgroundColor: 'black',
  padding: '10px',
  color: 'whitesmoke',
  zIndex: 1,
};

const sceneStyles = {
  position: 'absolute',
  top: '70px',
  width: '100%',
  height: '100%',
};

const headerStyles = {
  ...commonStyles,
  borderBottom: '2px solid darkgrey',
  display: 'flex',
  justifyContent: 'space-between',
  position: 'absolute',
  alignItems: 'center',
  top: 0,
};

const footerStyles = {
  ...commonStyles,
  borderTop: '2px solid darkgrey',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  bottom: 0,
};

export const ModuleDetails = () => {
  const { id } = useParams();
  const module = modules.find((m) => m.id === id);
  const Component = moduleRouterMap[module.id];

  return (
    <div style={generalContainerStyles}>
      <div style={headerStyles}>
        <h1>{module.name}</h1>
        <p style={{ marginRight: '20px' }}>{module.description}</p>
      </div>
      <div style={sceneStyles}>
        {module.id === 'transactions' ? (
          <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
            <Component />
          </Canvas>
        ) : (
          <Component />
        )}
      </div>
      <div style={footerStyles}>
        <a href='/'>Return to scene</a>
      </div>
    </div>
  );
};
