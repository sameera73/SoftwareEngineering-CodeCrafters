import { useState, useEffect } from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import api from "../../../services/axiosConfig";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("stats");
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <Typography>Loading...</Typography>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const amount = [
    { name: "Total Paid", value: data.total_amount_paid || 0 },
    { name: "Total Due", value: data.total_amount_due || 0 },
  ];

  const salesData = [
    { name: "Completed Sales", value: data.completed_sales_orders },
    { name: "Incomplete Sales", value: data.incomplete_sales_orders },
  ];

  const purchaseData = [
    { name: "Completed Purchases", value: data.completed_purchase_orders },
    { name: "Incomplete Purchases", value: data.incomplete_purchase_orders },
  ];

  // Sum of all data values to check if they are all zero
  const totalValues = amount.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Business Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <Typography
              variant="h6"
              style={{
                marginBottom: 20,
                color: "#4285F4",
                fontWeight: "bold",
              }}
            >
              Total Profit
            </Typography>
            <Typography
              variant="h4"
              component="div"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 150,
                height: 150,
                borderRadius: "50%",
                backgroundColor: "rgb(242 242 242)",
                color: "#3f51b5",
                fontSize: "2rem",
                fontWeight: "bold",
                boxShadow: "0px 3px 15px rgba(0,0,0,0.2)",
              }}
            >
              ${(data.total_profit || 0).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6">Financial Overview</Typography>
            <ResponsiveContainer width="100%" height={270}>
              {totalValues === 0 ? (
                <Typography variant="subtitle1" style={{ textAlign: "center", paddingTop: "135px" }}>
                  No data to show
                </Typography>
              ) : (
                <PieChart>
                  <Pie data={amount} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {amount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6">Sales Order Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6">Purchase Order Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purchaseData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
