import React, { useState, useEffect } from 'react';
import { useWeb3 } from './ConnectWallet'; // Import the useWeb3 hook to access web3 instance and other context variables
import NFTMintDN404 from '../contracts/NFTMintDN404.json'
import { Container, CardMedia, Grid, Card, CardContent, Link, Typography, Box} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';



function Home() {
    const { web3js, nftFactoryContract, connected } = useWeb3(); // Destructure variables from the Web3 context
    const [nftListings, setNftListings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (connected) {
            fetchListings();
        }
    }, [connected]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const allListings = await nftFactoryContract.methods.getAllContractAddresses().call();
            
            // Flatten the 2D array to get a single array of contract addresses
            const flattenedAddresses = allListings.flat();
    
            const listingsWithURI = await Promise.all(
                flattenedAddresses.map(async (address) => {
                    const URI = await getURI(address);
                    const name = await getName(address);
                    return { nftAddress: address, URI, name };
                })
            );
    
            setNftListings(listingsWithURI);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    const getURI = async (nftAddress) => {
        setLoading(true);
        const NFTInstance = new web3js.eth.Contract(NFTMintDN404.abi, nftAddress);
        const URI = await NFTInstance.methods.getURI().call();
        const response = await fetch(URI);
        const metadata = await response.json();
        setLoading(false);
        return metadata.image;
    };

    const getName = async (nftAddress) => {
        setLoading(true);
        const NFTInstance = new web3js.eth.Contract(NFTMintDN404.abi, nftAddress);
        const name = await NFTInstance.methods.name().call();
        setLoading(false);
        return name;
    };

    return (
        <Container maxWidth="md">
        <Typography variant="overline" fontSize={40}>All NFTs minted</Typography>
        {connected ? (
            loading ? (
                <Box>
                <CircularProgress />
                </Box>
            ) : nftListings.length > 0 ? (
                <Grid container spacing={2}>
                    {nftListings.map((listing, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Link href={`https://nftmarketplace-a.vercel.app/${listing.nftAddress}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card sx={{ '&:hover': { boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.3)', cursor: 'pointer' } }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={listing.URI}
                                        alt={`NFT ${index}`}
                                    />
                                    <CardContent sx={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                                        <Typography variant="h5">{listing.name}</Typography>
                                    </CardContent>
                                </Card>
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <p>No NFT minted</p>
            )
        ) : (
            <p>Connect your wallet to continue</p>
        )}
    </Container>
);
}

export default Home;
