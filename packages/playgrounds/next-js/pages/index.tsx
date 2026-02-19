/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from 'react';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import Head from 'next/head';
import { Product, Profile } from '../components/';
import {
  Experience,
  useNinetailed,
  useProfile,
} from '@ninetailed/experience.js-next';
import {
  BaselineWithExperiencesEntry,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import product from '../../fixtures/contentful/product-with-experiences.json';
import productWithExperiment from '../../fixtures/contentful/product-with-experiment.json';
import productWithPersonalization from '../../fixtures/contentful/product-with-personalization.json';
import { experienceMapper } from '../utils/experienceMapper';
import { getAllExperiences } from '../api/getAllExperiences';
import { getAllAudiences } from '../api/getAllAudiences';

const personalizationVariants = [
  {
    id: '1',
    headline: (
      <>
        The Power of Personalization with{' '}
        <a href="https://ninetailed.io/">Ninetailed</a> and{' '}
        <a href="https://nextjs.org">Next.js!</a>
      </>
    ),
    audience: {
      id: '4IBSwLRvM1gdBidtnsh4h',
      name: 'Audience 1',
    },
  },
  {
    id: '2',
    headline: (
      <>
        Enhance your Customer Experience with{' '}
        <a href="https://ninetailed.io/">Ninetailed</a> and{' '}
        <a href="https://nextjs.org">Next.js!</a>
      </>
    ),
    audience: {
      id: '51AL1dMNXkvx1BkQd3wPR1',
      name: 'Audience 2',
    },
  },
];

export function Index() {
  const experiences = productWithExperiment.fields.nt_experiences.map(
    (ctfExperience) => {
      const mapped = ExperienceMapper.mapCustomExperience(
        ctfExperience,
        (variant) => ({ id: variant.sys.id, ...variant.fields })
      );

      return mapped;
    }
  );

  const profile = useProfile();
  /*const mapVariant: MapVariant<Entry & { fields: { foo: 'string' } }> = (
    variant
  ) => {
    return {
      id: '',
      x: variant.fields.foo,
    };
  };*/

  /*const x = ntExperiences
    .filter(ExperienceMapper.isExperienceEntry)
    .map((experience) =>
      ExperienceMapper.mapExperience(experience as ExperienceEntry)
    );*/
  /*console.log(x);*/

  /**
   * testing cyclic data structures as params
   */
  const cyclicObj = { key: 'value' };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  cyclicObj.self = cyclicObj;

  const { track, identify, page } = useNinetailed();
  useEffect(() => {
    /*track('test', {
      cycle: cyclicObj,
    });*/
    /*identify('test', {
      cycle: cyclicObj,
    });*/
    /*page({
      cycle: cyclicObj,
    });*/
  }, []);

  /**
   * testing jsx (cyclic data structures) as params
   */
  /*const jsxElement = <>Hello World</>;*/

  /*const productField = product.fields;
  console.log({ productField });
  const enhancedProductField = {
    ...product.fields,
    enhancedField: jsxElement,
  };
  console.log({ enhancedProductField });*/

  /*
   * Replace the elements below with your own.#
   *
   * Note: The corresponding styles are in the ./index.css file.
   */
  return (
    <div className={styles.page}>
      <Head>
        <title>Internal Local Test Environment</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.h2}>Ninetailed Profile</h2>
          <Profile />
        </div>

        <div className={styles.card}>
          <h3 className={styles.h2}>Switch Page</h3>
          <Link legacyBehavior href="/index2">
            Link to index2
          </Link>
        </div>

        {/* <div className={styles.card}> */}
        {/* <h2
            className={styles.h2}
          >{`Ninetailed <Personalize /> Component`}</h2>
          <hr />
          <h3 className={styles.h3}>Non Personalized Hero</h3>

          <Personalize
            id={'nonPersonalizedHero'}
            component={Hero}
            holdout={100}
            headline={
              <>
                {' '}
                Welcome to <a href="https://nextjs.org">Next.js!</a>
              </>
            }
            variants={personalizationVariants}
          /> */}
        {/* <h3 className={styles.h3}>Personalized Hero</h3> */}
        {/* <Personalize
            id={'personalizedHero'}
            component={Hero}
            holdout={0}
            headline={
              <>
                Welcome to <a href="https://nextjs.org">Next.js!</a>
              </>
            }
            variants={personalizationVariants}
          /> */}
        {/* </div> */}
        <div className={styles.card}>
          <h2 className={styles.h2}>{`Ninetailed <Experience /> Component`}</h2>
          <hr />
          <h3 className={styles.h3}>with Experiment</h3>
          <Experience
            id={productWithExperiment.sys.id}
            /* keyAddition="1"*/
            component={Product}
            trackClicks
            experiences={productWithExperiment.fields.nt_experiences.map(
              (ctfExperience) => {
                const mapped = ExperienceMapper.mapCustomExperience(
                  ctfExperience,
                  (variant) => ({ id: variant.sys.id, ...variant.fields })
                );

                return mapped;
              }
            )}
            passthroughProps={{
              onClick: () => {
                // console.log('click');
              },
              test: 'test',
              productName: '',
              /*moreProps: jsxElement,*/
            }}
            {...productWithExperiment.fields}
          />
          {/* <h3 className={styles.h3}>with Personalization</h3>
          <Experience
            {...productWithPersonalization.fields}
            id={productWithPersonalization.sys.id}
            component={Product}
            experiences={productWithPersonalization.fields.nt_experiences.map(
              (ctfExperience) => {
                const mapped = ExperienceMapper.mapCustomExperience(
                  ctfExperience,
                  (variant) => ({ id: variant.sys.id, ...variant.fields })
                );

                return mapped;
              }
            )}
            passthroughProps={{
              onClick: () => {
                // console.log('clicked');
              },
            }}
          /> */}
        </div>

        <div className={styles.card}>
          <h2
            className={styles.h2}
          >{`Extensive <Experience /> Component Testing`}</h2>
          <hr />
          {/* <Personalize
            id="base"
            //headline={jsxElement}
            headline={'Non Personalized Hero'}
            component={Hero}
            variants={personalizationVariants}
            holdout={0}
          /> */}
          <Experience
            // loadingComponent={getSSRLoadingComponent(
            //   decodeExperienceVariantsMap('13gr03iDPXcOIVJmGVnRy6=1')
            // )}
            // productName={product.fields.name}
            // productName={product.fields.productName}
            /*keyAddition="2"*/
            id={product.sys.id}
            component={Product}
            trackClicks
            experiences={experienceMapper(
              product as unknown as BaselineWithExperiencesEntry
            )}
            // loadingComponent={(innerProps) => (
            //   <DefaultExperienceLoadingComponent
            //     {...innerProps}
            //     unhideAfterMs={1000}
            //   />
            // )}
            passthroughProps={{
              onClick: () => {
                // console.log('click');
              },
              test: 'test',
              productName: '',
            }}
            {...product.fields}
          />
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const allExperiences = await getAllExperiences();
  const allAudiences = await getAllAudiences();

  const experiences = productWithPersonalization.fields.nt_experiences.map(
    (ctfExperience) => {
      const mapped = ExperienceMapper.mapCustomExperience(
        ctfExperience,
        (variant) => ({ id: variant.sys.id, ...variant.fields })
      );
      return mapped;
    }
  );

  return {
    props: {
      experiences,

      ninetailed: {
        preview: {
          allExperiences,
          allAudiences,
        },
      },
    },
  };
}

export default Index;
