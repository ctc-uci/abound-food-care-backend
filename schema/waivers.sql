CREATE TABLE IF NOT EXISTS public.waiver
(
    waiver_id integer NOT NULL,
    name character varying COLLATE pg_catalog."default" NOT NULL,
    link character varying COLLATE pg_catalog."default",
    event_id integer,
    notes text COLLATE pg_catalog."default",
    CONSTRAINT waiver_pkey PRIMARY KEY (waiver_id),
    CONSTRAINT event_id FOREIGN KEY (event_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
