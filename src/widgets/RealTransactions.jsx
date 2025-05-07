// <!DOCTYPE html>
// <html lang="ru">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Somnia Transaction Flow</title>
//   <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.min.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/@react-three/fiber@8.17.7/dist/react-three-fiber.min.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/@react-three/drei@9.114.0/dist/index.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/web3@4.5.0/dist/web3.min.js"></script>
//   <script src="https://cdn.tailwindcss.com"></script>
// </head>
// <body>
//   <div id="root"></div>
//   <script type="text/babel">
//     const { React, ReactDOM, THREE, useFrame, useThree, Canvas, OrbitControls, Html } = window;

//     // Определение модулей и их свойств
//     const modules = [
//       { id: 'DeFi', name: 'DeFi', position: [3, 0, 0], color: 0xff0000, description: 'Децентрализованные финансы' },
//       { id: 'Gaming', name: 'Gaming', position: [1.5, 0, 2.598], color: 0x00ff00, description: 'Игровые приложения' },
//       { id: 'AISocial', name: 'AI/Social', position: [-1.5, 0, 2.598], color: 0xff00ff, description: 'AI и социальные платформы' },
//       { id: 'Metaverse', name: 'Metaverse', position: [-3, 0, 0], color: 0xffff00, description: 'Метавселенные' },
//       { id: 'NFT', name: 'NFT', position: [-1.5, 0, -2.598], color: 0xffa500, description: 'Невзаимозаменяемые токены' },
//       { id: 'Infrastructure', name: 'Infrastructure', position: [1.5, 0, -2.598], color: 0x0000ff, description: 'Инфраструктура сети' },
//     ];

//     // Плейсхолдер для маппинга адресов контрактов
//     const contractToModule = {
//       '0xdeficontract1': 'DeFi',
//       '0xgamingcontract1': 'Gaming',
//       '0xaisocialcontract1': 'AISocial',
//       '0xmetaversecontract1': 'Metaverse',
//       '0xnftcontract1': 'NFT',
//       '0xinfrastructurecontract1': 'Infrastructure',
//     };

//     function getModuleFromAddress(address) {
//       return contractToModule[address?.toLowerCase()];
//     }

//     // Компонент модуля
//     function Module({ id, position, color, name, description }) {
//       const meshRef = React.useRef();
//       const [hovered, setHovered] = React.useState(false);

//       return (
//         <mesh
//           ref={meshRef}
//           position={position}
//           onPointerOver={() => setHovered(true)}
//           onPointerOut={() => setHovered(false)}
//         >
//           <octahedronGeometry args={[0.5, 0]} />
//           <meshStandardMaterial color={color} />
//           {hovered && (
//             <Html position={[0, 1, 0]}>
//               <div className="bg-gray-800 text-white p-2 rounded shadow-lg pointer-events-none">
//                 <h3 className="text-sm font-bold">{name}</h3>
//                 <p className="text-xs">{description}</p>
//               </div>
//             </Html>
//           )}
//         </mesh>
//       );
//     }

//     // Компонент частиц
//     function TransactionParticles({ transactions }) {
//       const particlesRef = React.useRef();
//       const { scene } = useThree();
//       const maxParticles = 100;
//       const positions = new Float32Array(maxParticles * 3);
//       const colors = new Float32Array(maxParticles * 3);
//       const particleGeometry = new THREE.BufferGeometry();
//       particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//       particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
//       const particleMaterial = new THREE.PointsMaterial({
//         vertexColors: true,
//         size: 0.1,
//         transparent: true,
//         opacity: 0.8,
//       });
//       const particles = new THREE.Points(particleGeometry, particleMaterial);
//       scene.add(particles);
//       particlesRef.current = particles;

//       useFrame((state) => {
//         const currentTime = state.clock.getElapsedTime();
//         const activeParticles = transactions.filter(p => {
//           const duration = 2;
//           const progress = (currentTime - p.startTime) / duration;
//           return progress < 1;
//         });

//         const positions = [];
//         const colorsArray = [];
//         activeParticles.forEach((p) => {
//           const startPos = modules.find(m => m.id === p.fromId).position;
//           const endPos = modules.find(m => m.id === p.toId).position;
//           const duration = 2;
//           const progress = (currentTime - p.startTime) / duration;
//           const position = new THREE.Vector3().lerpVectors(
//             new THREE.Vector3(...startPos),
//             new THREE.Vector3(...endPos),
//             progress
//           );
//           positions.push(position.x, position.y, position.z);
//           const color = modules.find(m => m.id === p.fromId).color;
//           colorsArray.push((color >> 16) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255);
//         });

//         particlesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
//         particlesRef.current.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArray, 3));
//         particlesRef.current.geometry.setDrawRange(0, activeParticles.length);
//         particlesRef.current.geometry.attributes.position.needsUpdate = true;
//         particlesRef.current.geometry.attributes.color.needsUpdate = true;
//       });

//       return null;
//     }

//     // Основной компонент сцены
//     function TransactionFlowScene() {
//       const [transactions, setTransactions] = React.useState([]);

//       // Mock-транзакции (заменить на WebSocket)
//       React.useEffect(() => {
//         const interval = setInterval(() => {
//           const fromId = modules[Math.floor(Math.random() * modules.length)].id;
//           let toId = modules[Math.floor(Math.random() * modules.length)].id;
//           while (toId === fromId) {
//             toId = modules[Math.floor(Math.random() * modules.length)].id;
//           }
//           setTransactions(prev => [...prev, { fromId, toId, startTime: Date.now() / 1000 }].slice(-100));
//         }, 1000);
//         return () => clearInterval(interval);
//       }, []);

//       return (
//         <>
//           {modules.map((module) => (
//             <Module
//               key={module.id}
//               id={module.id}
//               position={module.position}
//               color={module.color}
//               name={module.name}
//               description={module.description}
//             />
//           ))}
//           <TransactionParticles transactions={transactions} />
//         </>
//       );
//     }

//     // Главный компонент приложения
//     function App() {
//       return (
//         <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[10, 10, 5]} intensity={1} />
//           <TransactionFlowScene />
//           <OrbitControls />
//         </Canvas>
//       );
//     }

//     ReactDOM.render(<App />, document.getElementById('root'));
//   </script>
// </body>
// </html>
