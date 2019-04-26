const Tour = require('../../../lib/Model/Tour');
const TourStop = require('../../../lib/Model/TourStop');
const mongoose = require('mongoose');
const tours = require('../../../lib/routes/tours');
const request = require('supertest');
const app = require('../../../lib/app');
const getWeather = require('../../../lib/services/weather');
jest.mock('../../../lib/services/weather.js');
require('../data-helper');

describe('tours route', () => {
    const date = new Date;
    it('can post a tour', () => {
        return request(app)
            .post('/api/v1/tours')
            .send({
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            })
            .then(created => {
                
                expect(created.body).toEqual({
                    title:'first tour',
                    activities: ['poledancing', 'trapese'],
                    date:date.toISOString(),
                    __v: 0,
                    _id: expect.any(String),
                    stops: []

                });
            });          
    });
    it('can get all tours', () => {
        return Tour.create(
            {
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            }
        )
            .then(()=>{
                return request(app)
                    .get('/api/v1/tours/')
                    .then(received=>{
                        expect(received.body.length).toEqual(1);
                    });
            });
    });
    it('can get a tour by id', () => {
        return Tour.create(
            {
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            })
            .then(created=>{
                const id = created.id;
                return request(app)
                    .get(`/api/v1/tours/${id}`)
                    .then(foundTours =>{
                        expect(foundTours.body).toEqual({
                            title:'first tour',
                            activities: ['poledancing', 'trapese'],
                            date:date.toISOString(),
                            stops:[]
                        });
                    });
              
            });
    });

    it('can post a stop to a tour', ()=>{
        
        return Promise.all([
            getWeather(),
            request(app).post('/api/v1/tours') .send({
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            })
        ])
            .then(([receivedWeather, createdTour])=>{
                const createdTourId = createdTour.body._id;
                const location = receivedWeather.latt_long;
                const weather = receivedWeather.currentWeather;
                return request(app)
                    .post(`/api/v1/tours/${createdTourId}/stops`)
                    .send({
                        location,
                        weather,
                        attendance:600
                    });
            })
            .then(updatedTour=>{ 
                return expect(updatedTour.body.stops[0]).toEqual({
                    _id: expect.any(String),
                    attendance: 600,
                    weather: 'Heavy Cloud'
                });
            });
            
           
         
        
    });
    it('can delete a post from a tour', ()=>{
        //created a post and a tour so that they can be deleted
        return Promise.all([
            getWeather(),
            request(app).post('/api/v1/tours') .send({
                title:'first tour',
                activities: ['poledancing', 'trapese'],
                date:date
            })
        ])
            .then(([receivedWeather, createdTour])=>{
                const createdTourId = createdTour.body._id;
             
                const location = receivedWeather.latt_long;
                const weather = receivedWeather.currentWeather;
                return request(app)
                    .post(`/api/v1/tours/${createdTourId}/stops`)
                    .send({
                        location,
                        weather,
                        attendance:600
                    }); //created tour and stop ^^
            })//created tour and stop ^^
            ///tours/:id/stops/:stopId/attendence
            .then(tourWithTourStop=>{
                const tourToRemoveStopFromId = tourWithTourStop.body._id;
                const tourStopId = tourWithTourStop.body.stops[0]._id;
                return request(app)
                    .delete(`/api/v1/tours/${tourToRemoveStopFromId}/stops/${tourStopId}`)
                    .then(updatedTour=>{
                        expect(updatedTour.body).toEqual({
                            _id:tourStopId,
                            attendance:expect.any(Number),
                            weather: expect.any(String)

                        });
                    });
                    
            });
    });
   


});
