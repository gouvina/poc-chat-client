"use client"

import { Document } from '@/app/types/document'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

type DocumentDetailsProps = {
    document: Document
}

export function DocumentDetails({ document }: DocumentDetailsProps) {
    const t = useTranslations('Documents')
    const [panels, setPanels] = useState(true)

    const changeView = () => {
        const prev = panels
        setPanels(!prev)
    }

    // Panels
    return (
        <div className='flex h-full flex-col'>
            <button
                type="button"
                onClick={changeView}
                className="flex w-full items-center gap-3 rounded-md py-1.5 transition-colors pb-3"
            >
                <div className={`relative h-6 w-[52px] rounded-full transition-colors duration-300 bg-[#555555]`}>
                    <span className="absolute inset-0 flex items-center justify-between px-1.5 text-[11px]" />

                    <div className={`
                                    absolute
                                    left-0.5 top-0.5
                                    h-5 w-5
                                    rounded-full
                                    bg-white
                                    shadow
                                    transition-transform
                                    duration-300
                                    ${panels ? "translate-x-7" : "translate-x-0"}`
                    } />
                </div>

                <span className="text-sm text-gray-500 dark:text-[#888888]">
                    {panels ? 'Panels' : 'Separator'}
                </span>
            </button>

            {panels ? (
                // Panels
                <div className='grid min-h-0 flex-1 w-full grid-cols-5 items-start gap-6'>
                    <div className='col-span-3 flex h-full min-h-0 flex-col'>
                        <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {t('Details.document')}
                        </h2>

                        <section className='min-h-0 flex-1 overflow-y-auto small-scrollbar rounded-lg bg-gray-100 p-6 dark:bg-[#2a2a2a]'>
                            <p className='whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300'>
                                {document.text}
                            </p>
                        </section>
                    </div>

                    <div className='col-span-2'>
                        <h2 className='mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {t('Details.details')}
                        </h2>

                        <aside className='rounded-lg bg-gray-100 p-6 dark:bg-[#2a2a2a]'>
                            <div className='divide-y divide-gray-200 dark:divide-[#4a4a4a]'>
                                <div className='py-3'>
                                    <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                        {t('Table.rowHeaders.id')}
                                    </p>
                                    <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                        {document.id}
                                    </p>
                                </div>

                                {document.page !== undefined && (
                                    <div className='py-3'>
                                        <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                            {t('Table.rowHeaders.page')}
                                        </p>
                                        <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                            {document.page}
                                        </p>
                                    </div>
                                )}

                                {document.score !== undefined && (
                                    <div className='py-3'>
                                        <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                            {t('Table.rowHeaders.score')}
                                        </p>
                                        <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                            {document.score}
                                        </p>
                                    </div>
                                )}

                                {document.version !== undefined && (
                                    <div className='py-3'>
                                        <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                            {t('Table.rowHeaders.version')}
                                        </p>
                                        <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                            {document.version}
                                        </p>
                                    </div>
                                )}

                                <div className='py-3'>
                                    <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                        {t('Details.roll')}
                                    </p>
                                    <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                        {document.roll.name}
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            ) : (
                // Separator
                <div className='grid min-h-0 flex-1 w-full grid-cols-5 items-start'>
                    <section className='col-span-3 h-full min-h-0 overflow-y-auto small-scrollbar border-r border-gray-300 dark:border-[#333333] h-full min-h-0 overflow-y-auto pr-8'>
                        <h2 className='mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {t('Details.document')}
                        </h2>
                        <p className='whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300'>
                            {document.text}
                        </p>
                    </section>

                    <aside className='col-span-2 pl-8'>
                        <h2 className='mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {t('Details.details')}
                        </h2>

                        <div className='divide-y divide-gray-200 dark:divide-[#333333]'>
                            <div className='py-3'>
                                <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                    {t('Table.rowHeaders.id')}
                                </p>
                                <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                    {document.id}
                                </p>
                            </div>

                            {document.page !== undefined && (
                                <div className='py-3'>
                                    <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                        {t('Table.rowHeaders.page')}
                                    </p>
                                    <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                        {document.page}
                                    </p>
                                </div>
                            )}

                            {document.score !== undefined && (
                                <div className='py-3'>
                                    <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                        {t('Table.rowHeaders.score')}
                                    </p>
                                    <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                        {document.score}
                                    </p>
                                </div>
                            )}

                            {document.version !== undefined && (
                                <div className='py-3'>
                                    <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                        {t('Table.rowHeaders.version')}
                                    </p>
                                    <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                        {document.version}
                                    </p>
                                </div>
                            )}

                            <div className='py-3'>
                                <p className='text-sm text-gray-500 dark:text-[#b0b0b0]'>
                                    {t('Details.roll')}
                                </p>
                                <p className='mt-1 text-gray-900 dark:text-gray-100'>
                                    {document.roll.name}
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}