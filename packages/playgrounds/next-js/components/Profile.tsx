import React from 'react';
import styles from '../pages/index.module.css';
import { useNinetailed, useProfile } from '@ninetailed/experience.js-next';

export const Profile: React.FC = () => {
  const { reset } = useNinetailed();
  const { profile } = useProfile();
  return (
    <>
      <pre className={styles.code}>
        {profile && JSON.stringify(profile, null, 4)}
      </pre>
      <button onClick={reset}>Reset Profile</button>
    </>
  );
};
