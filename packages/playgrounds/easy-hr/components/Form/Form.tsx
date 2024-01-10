import React, { useState } from 'react';
import { useNinetailed, useProfile } from '@ninetailed/experience.js-next';
import { Field, Form as ContactForm } from 'react-final-form';
import * as Yup from 'yup';
import { makeValidate } from '@/lib/Validation';

export const Form: React.FC = () => {
  const { profile } = useProfile();
  const { identify } = useNinetailed();
  const [showForm, setShowForm] = useState<boolean>(true);

  type Traits = {
    [key: string]: string;
  };

  const onSubmit = (values: Traits) => {
    if (profile) {
      identify(profile.id, values)
        .then((_) => {
          return _;
        })
        .catch((e: Error) => {
          return e;
        });
      setShowForm(false);
    } else {
      console.warn('Submitting form data failed. Profile could not be loaded');
    }
  };
  const errorTextRequired = 'is required';
  const validationSchema = Yup.object({
    firstname: Yup.string().required(`First Name ${errorTextRequired}`),
    lastname: Yup.string().required(`Last Name ${errorTextRequired}`),
    companyname: Yup.string().required(`Company Name ${errorTextRequired}`),
    companysize: Yup.string().ensure().required(`Company ${errorTextRequired}`),
    email: Yup.string().email().required(`Business Email ${errorTextRequired}`),
  });
  const validate = makeValidate(validationSchema);
  return (
    <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-12 lg:max-w-7xl">
      {showForm ? (
        <ContactForm
          onSubmit={onSubmit}
          validate={validate}
          render={({ handleSubmit }) => {
            return (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-4 items-start"
              >
                <fieldset className="flex flex-row w-full justify-between">
                  <Field name="firstname">
                    {({ input, meta }) => {
                      return (
                        <div className="w-[48%] flex flex-col">
                          <label htmlFor="firstname" className="text-[14px]">
                            First Name
                            <span className="text-[#f2545b]">*</span>
                          </label>
                          <input
                            {...input}
                            type="text"
                            placeholder="First Name"
                            className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] border-[1px] rounded-[3px] border-[#cbd6e2] focus:outline-indigo-600"
                          />
                          {meta.error && meta.touched && (
                            <span className="text-[#f2545b] text-[14px]">
                              {meta.error}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  </Field>
                  <Field name="lastname">
                    {({ input, meta }) => {
                      return (
                        <div className="w-[48%] flex flex-col">
                          <label htmlFor="lastname" className="text-[14px]">
                            Last Name<span className="text-[#f2545b]">*</span>
                          </label>
                          <input
                            {...input}
                            type="text"
                            placeholder="Last Name"
                            className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2]"
                          />
                          {meta.error && meta.touched && (
                            <span className="text-[#f2545b] text-[14px]">
                              {meta.error}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  </Field>
                </fieldset>
                <fieldset className="flex flex-row w-full">
                  <Field name="companyname">
                    {({ input, meta }) => {
                      return (
                        <div className="w-full flex flex-col">
                          <label htmlFor="companyname" className="text-[14px]">
                            Company name
                            <span className="text-[#f2545b]">*</span>
                          </label>
                          <input
                            {...input}
                            type="text"
                            placeholder="Company name"
                            className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2]"
                          />
                          {meta.error && meta.touched && (
                            <span className="text-[#f2545b] text-[14px]">
                              {meta.error}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  </Field>
                </fieldset>

                <fieldset className="flex flex-col w-full ">
                  <label htmlFor="companysize" className="text-[14px]">
                    Company Size<span className="text-[#f2545b]">*</span>
                  </label>
                  <Field name="companysize" placeholder="Select your option">
                    {({ input, meta }) => {
                      return (
                        <>
                          <select
                            {...input}
                            className={` border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2] ${
                              input.value === '' ? 'text-gray-400' : ''
                            }`}
                          >
                            <option value="" disabled>
                              Select your option
                            </option>
                            <option value="1-50">1-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501-1000">501-1000</option>
                            <option value="1001-2000">1001-2000</option>
                            <option value="more than 2000">
                              more than 2000
                            </option>
                          </select>
                          {meta.error && meta.touched && (
                            <span className="text-[#f2545b] text-[14px]">
                              {meta.error}
                            </span>
                          )}
                        </>
                      );
                    }}
                  </Field>
                </fieldset>
                <fieldset className="flex flex-row w-full">
                  <Field name="email">
                    {({ input, meta }) => {
                      return (
                        <div className="w-full flex flex-col">
                          <label htmlFor="email" className="text-[14px]">
                            Business Email
                            <span className="text-[#f2545b]">*</span>
                          </label>
                          <input
                            {...input}
                            type="text"
                            placeholder="Business Email"
                            className="border-2 bg-[#f5f8fa] h-[40px] px-[15px] focus:outline-indigo-600 border-[1px] rounded-[3px] border-[#cbd6e2]"
                          />
                          {meta.error && meta.touched && (
                            <span className="text-[#f2545b] text-[14px]">
                              {meta.error}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  </Field>
                </fieldset>

                <button
                  className="bg-indigo-500 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75"
                  type="submit"
                >
                  Submit
                </button>
              </form>
            );
          }}
        />
      ) : (
        <h2>Thanks for submitting</h2>
      )}
    </div>
  );
};
