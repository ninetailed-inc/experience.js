import styles from '../styles/Home.module.css';
import { Hero, Product, Profile } from '../components';
import { Experience, Personalize } from '@ninetailed/experience.js-next';

import { experienceMapper } from '../utils/experienceMapper';
import product from '../../fixtures/contentful/product-with-experiences.json';
import Link from 'next/link';
import { BaselineWithExperiencesEntry } from '@ninetailed/experience.js-utils-contentful';

export function Index() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.h1}>INDEX 2</h1>
        <div className={styles.card}>
          <h2 className={styles.h2}>Ninetailed Profile</h2>
          <Profile />
        </div>

        <div className={styles.card}>
          <h3 className={styles.h2}>Switch Page</h3>
          <Link legacyBehavior href="/">
            Link to index page
          </Link>
        </div>

        <div className={styles.card}>
          <h2
            className={styles.h2}
          >{`Ninetailed <Personalize /> Component`}</h2>
          <hr />
          <h3 className={styles.h3}>Non Personalized Hero</h3>
          <Personalize
            id="base"
            headline="Non Personalized Hero"
            component={Hero}
            variants={[
              {
                id: '1',
                headline: 'Alex Test - Preview Widget',
                audience: {
                  id: '123',
                },
              },
              {
                id: '1',
                headline: "I'm Personalized",
                audience: {
                  id: 'bc0df78a-e765-41b9-ad60-d64bd5772ed2',
                },
              },
            ]}
            holdout={0}
          />
        </div>
        <div className={styles.card}>
          <h2 className={styles.h2}>{`Ninetailed <Experience /> Component`}</h2>
          <hr />
          <h3 className={styles.h3}>with Experiment</h3>
          <Experience
            {...product}
            // loadingComponent={getSSRLoadingComponent(
            //   decodeExperienceVariantsMap('13gr03iDPXcOIVJmGVnRy6=1')
            // )}
            id={product.sys.id}
            component={Product}
            experiences={experienceMapper(
              product as unknown as BaselineWithExperiencesEntry
            )}
            // loadingComponent={(innerProps) => <DefaultExperienceLoadingComponent {...innerProps} unhideAfterMs={1000}/>}
          />
        </div>
      </main>
    </div>
  );
}

export default Index;
