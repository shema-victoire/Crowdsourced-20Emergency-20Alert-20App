import { RequestHandler } from "express";
import { connectToDatabase } from "../config/database";

interface EmergencyAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_address: string;
  province: string;
  district: string;
  status: string;
  created_at: string;
  user_name: string;
}

export const getAlerts: RequestHandler = async (req, res) => {
  try {
    const client = await connectToDatabase();

    const query = `
      SELECT 
        a.id,
        a.alert_type,
        a.severity,
        a.title,
        a.description,
        a.latitude,
        a.longitude,
        a.location_address,
        a.province,
        a.district,
        a.status,
        a.created_at,
        u.full_name as user_name
      FROM emergency_alerts a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT 20
    `;

    const result = await client.query(query);
    await client.end();

    res.json({
      success: true,
      alerts: result.rows,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch emergency alerts",
    });
  }
};

export const createAlert: RequestHandler = async (req, res) => {
  try {
    const {
      alert_type,
      severity,
      title,
      description,
      latitude,
      longitude,
      location_address,
      province,
      district,
      user_id,
    } = req.body;

    const client = await connectToDatabase();

    const query = `
      INSERT INTO emergency_alerts 
      (alert_type, severity, title, description, latitude, longitude, location_address, province, district, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at
    `;

    const values = [
      alert_type,
      severity,
      title,
      description,
      latitude,
      longitude,
      location_address,
      province,
      district,
      user_id,
    ];
    const result = await client.query(query, values);
    await client.end();

    res.json({
      success: true,
      alert: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create emergency alert",
    });
  }
};

export const getEmergencyContacts: RequestHandler = async (req, res) => {
  try {
    const client = await connectToDatabase();

    const query = `
      SELECT 
        service_name,
        phone_number,
        service_type,
        province,
        district,
        is_national
      FROM emergency_contacts
      ORDER BY is_national DESC, service_type, service_name
    `;

    const result = await client.query(query);
    await client.end();

    res.json({
      success: true,
      contacts: result.rows,
    });
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch emergency contacts",
    });
  }
};

export const getRwandaLocations: RequestHandler = async (req, res) => {
  try {
    const client = await connectToDatabase();

    const query = `
      SELECT DISTINCT province, district, sector, latitude, longitude
      FROM rwanda_locations
      ORDER BY province, district, sector
    `;

    const result = await client.query(query);
    await client.end();

    res.json({
      success: true,
      locations: result.rows,
    });
  } catch (error) {
    console.error("Error fetching Rwanda locations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Rwanda locations",
    });
  }
};
