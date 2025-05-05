import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * BezierLine
 *
 * Рисует толстую кривую Безье в 3D с заданными параметрами.
 * Интерфейс:
 *  - start: [x,y,z]
 *  - end: [x,y,z]
 *  - color: строка (hex или CSS-цвет)
 *  - width: радиус трубы
 *  - curvature: степень изгиба (для одного опорного)
 *  - controlPoints (опционально): дополнительный массив опорных точек [[x,y,z], ...]
 *  - segments (опционально): число сегментов по длине кривой (по умолчанию 50)
 */
export const BezierLine = ({
  start,
  end,
  color = '#ffffff',
  width = 0.5,
  curvature = 1,
  controlPoints = [],
  segments = 100,
}) => {
  /**
   * Строим кривую в зависимости от числа опорных точек:
   * - 0 дополнительных: QuadraticBezier с одним опорным, смещенным по перпендикуляру
   * - 1 доп.: QuadraticBezier с заданным
   * - 2 доп.: CubicBezier
   * - 3+ доп.: CatmullRomCurve
   */
  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(start[0], start[1], start[2]);
    const endVec = new THREE.Vector3(end[0], end[1], end[2]);

    let cpVecs = [];
    if (controlPoints.length >= 2) {
      // CubicBezier
      cpVecs = controlPoints.slice(0, 2).map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      return new THREE.CubicBezierCurve3(startVec, cpVecs[0], cpVecs[1], endVec);
    } else if (controlPoints.length === 1) {
      // QuadraticBezier с user-контрольной точкой
      const cp = new THREE.Vector3(controlPoints[0][0], controlPoints[0][1], controlPoints[0][2]);
      return new THREE.QuadraticBezierCurve3(startVec, cp, endVec);
    } else {
      // QuadraticBezier с изгибом только по Y
      const mid = startVec.clone().add(endVec).multiplyScalar(0.5);
      mid.y += curvature;
      return new THREE.QuadraticBezierCurve3(startVec, mid, endVec);
    }
  }, [start, end, curvature, controlPoints]);

  // TubeGeometry дает толстую "трубу"
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, segments, width, 8, false),
    [curve, segments, width],
  );

  return (
    <mesh geometry={tubeGeometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </mesh>
  );
};
