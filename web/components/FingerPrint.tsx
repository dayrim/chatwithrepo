'use client'

import { useAppState } from '@/hooks/useAppStore';
import React, { useEffect, useState } from 'react'

const convertToFingerprintUUID = (fingerprint: number): string => {
    const hexStr = fingerprint.toString(16).padStart(8, '0');
    return `${hexStr}-0000-4000-8000-000000000000`;
};
const Fingerprint = () => {
    const {
        setUserId,
        userId } = useAppState();
    useEffect(() => {
        const loadClientJS = async () => {
            const { ClientJS } = await import('clientjs');
            const client = new ClientJS();
            const fingerprint = client.getFingerprint();
            const fingerprintUUID = convertToFingerprintUUID(fingerprint);
            setUserId(fingerprintUUID);
        };

        loadClientJS();
    }, []);
    return (
        <></>
    )
}

export default Fingerprint
