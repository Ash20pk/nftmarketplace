import react from 'react';
import axios from 'axios';

  // Function to upload image to IPFS
  export const uploadToIPFS = async (image) => {
    try {
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

        // Create form data
        let formData = new FormData();
        formData.append('file', image);

        const metadata = JSON.stringify({
            name: 'Ticket Image',
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        const res = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'pinata_api_key': 'd1142b635c7d76135866',
                'pinata_secret_api_key': '8dcde5998daa70f74397623aa43ff9875f943856c31d7508ee6e0bb432464efb',
            },
        });

        return res.data.IpfsHash; // Return the CID

    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
    } finally {
    }
  };

  // Function to create IPFS link and upload updated metadata
export const uploadWithMetadata = async (image) => {
    try {
        // Upload image to IPFS and get CID
        const cid = await uploadToIPFS(image);

        // Create IPFS link
        const ipfsLink = `https://gateway.pinata.cloud/ipfs/${cid}`;

        // Create metadata with IPFS link
        const metadata = {
            description: 'Powered by Metaschool',
            external_url: 'https://metaschool.io/',
            image: ipfsLink,
            name: 'Metaschool Frens',
        };

        // Upload updated metadata to IPFS
        const metadataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': 'd1142b635c7d76135866',
                'pinata_secret_api_key': '8dcde5998daa70f74397623aa43ff9875f943856c31d7508ee6e0bb432464efb',
            },
        });

        const metadataCid = metadataRes.data.IpfsHash

        const metadataipfsLink = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;

        return metadataipfsLink; // Return the IPFS link to the metadata
    } catch (error) {
        console.error('Error uploading image with metadata to IPFS:', error);
        throw error; // Propagate the error
    }
};
