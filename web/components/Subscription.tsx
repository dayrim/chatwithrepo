import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Button, Modal } from 'flowbite-react';
import { useAppState } from '@/hooks/useAppStore';

interface SubscriptionModalProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ openModal, setOpenModal }) => {
    const [submitError, setSubmitError] = useState<string>('');
    const { userInfo } = useAppState();

    const formik = useFormik({
        initialValues: {},
        onSubmit: async () => {
            setSubmitError('');
            try {
                const response = await fetch(`/api/create-checkout-session`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        customerId: userInfo?.stripeCustomerId,
                        lookupKey: 'basic-plan', // Hardcoded for the basic plan
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const { url } = await response.json(); // Assuming your API returns JSON with a URL field
                if (url) {
                    window.location.href = url; // Directly redirect without fetching the URL
                } else {
                    throw new Error('Session URL not found');
                }
            } catch (error: any) {
                console.error('Error creating checkout session:', error);
                setSubmitError('Failed to initiate subscription. Please try again.');
            }
        },
    });

    return (
        <Modal show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Subscribe to the Basic Plan</Modal.Header>
            <form onSubmit={formik.handleSubmit}>
                <Modal.Body>
                    <p className="mb-4 text-sm text-gray-700">
                        You&apos;ve reached your maximum number of free attempts. Subscribe to our Basic Plan at 5 euros per month for unlimited access and more features.
                    </p>
                    {submitError && <p className="text-sm text-red-500">{submitError}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" color="dark">
                        Subscribe for 5€/Month
                    </Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default SubscriptionModal;
